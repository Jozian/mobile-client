import digest from 'helpers/digest';
import client from 'superagent-es6-promise';
import { take, put } from 'redux-saga/effects';
import { load, copy, remove } from 'helpers/platform/fs';
import getLocation from 'helpers/platform/gps';
import uuid from 'uuid';

const REQUEST_REMOVE_RESULT = 'mdg/results/REQUEST_REMOVE_RESULT';
const REQUEST_DUPLICATE_RESULT = 'mdg/results/REQUEST_DUPLICATE_RESULT';

const REMOVE_RESULT = 'mdg/results/REMOVE_RESULT';
const ADD_RESULT = 'mdg/results/ADD_RESULT';
const UPDATE_PROGRESS = 'mdg/results/UPDATE_PROGRESS';

const SUBMIT_RESULT = 'mdg/results/SUBMIT_RESULT';
const SUBMIT_RESULT_SUCCESS = 'mdg/results/SUBMIT_RESULT_SUCCESS';
const SUBMIT_RESULT_FAILURE = 'mdg/results/SUBMIT_RESULT_FAILURE';


const initialState = {
  list: {},
};

export default function resultsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_RESULT: {
      const { result } = action;
      return {
        ...state,
        list: {
          ...state.list,
          [result.id]: result,
        },
      };
    }
    case UPDATE_PROGRESS: {
      const { id, progress } = action;
      return {
        ...state,
        list: {
          ...state.list,
          [id]: {
            ...state.list[id],
            progress,
          },
        },
      };
    }
    case SUBMIT_RESULT: {
      const { id } = action;

      return {
        ...state,
        list: {
          ...state.list,
          [id]: {
            ...state.list[id],
            submitting: true,
          },
        },
      };
    }
    case SUBMIT_RESULT_SUCCESS: {
      const { id } = action;
      return {
        ...state,
        list: {
          ...state.list,
          [id]: {
            ...state.list[id],
            submitted: true,
            submitting: false,
          },
        },
      };
    }
    case SUBMIT_RESULT_FAILURE: {
      const { id } = action;
      return {
        ...state,
        list: {
          ...state.list,
          [id]: {
            ...state.list[id],
            submitted: false,
            submitting: false,
          },
        },
      };
    }
    case REMOVE_RESULT: {
      const newList = { ...state.list };
      delete newList[action.id];
      return {
        ...state,
        list: newList,
      };
    }
    default:
      return state;
  }
}

export function updateProgress(id, progress) {
  return {
    type: UPDATE_PROGRESS,
    id,
    progress,
  };
}

export function requestRemove(id) {
  return {
    type: REQUEST_REMOVE_RESULT,
    id,
  };
}

export function requestDuplicate(id, newName) {
  return {
    type: REQUEST_DUPLICATE_RESULT,
    id,
    newName,
  };
}

export function requestSubmit(id) {
  return {
    type: SUBMIT_RESULT,
    id,
  };
}


function* handleSubmit(getState) {
  while (true) {
    const { id } = yield take(SUBMIT_RESULT);
    try {
      const { surveyId, name, createdAt } = getState().results.list[id];
      const content = yield load({
        path: ['results'],
        name: `${surveyId}-${id}.xml`,
      });

      const oDOM = (new DOMParser()).parseFromString(content, 'text/xml');
      const oldMeta = oDOM.querySelector('meta');
      if (oldMeta) { oldMeta.remove(); }

      const meta = oDOM.createElement('orx:meta');
      const instanceIdTag = oDOM.createElement('orx:instanceID');
      instanceIdTag.textContent = name;
      meta.appendChild(instanceIdTag);
      const deviceIdTag = oDOM.createElement('orx:deviceID');
      deviceIdTag.textContent = 'test';
      meta.appendChild(deviceIdTag);

      if (createdAt) {
        const timeStartTag = oDOM.createElement('orx:timeStart');
        timeStartTag.textContent = createdAt;
        meta.appendChild(timeStartTag);
      }

      const timeEndTag = oDOM.createElement('orx:timeEnd');
      timeEndTag.textContent = (new Date()).toISOString();
      meta.appendChild(timeEndTag);

      if (getState().settings.gpsTracking) {
        const location = yield getLocation();
        const locationTag = oDOM.createElement('orx:geostamp');
        locationTag.textContent = `${location.latitude} ${location.longitude}`;
        meta.appendChild(locationTag);
      }
      oDOM.firstChild.insertBefore(meta, oDOM.firstChild.firstElementChild);
      const result = (new XMLSerializer()).serializeToString(oDOM);


      const blob = new Blob([result], { type: 'text/xml' });
      const { url, login, password } = getState().credentials;
      const path = '/PostResults';
      const auth = digest('POST', path, `${login}:${password}`);
      yield client
        .post(`${url}${path}`)
        .set('Authorization', auth)
        .field('surveyId', surveyId)
        .attach('filename', blob, 'result.xml')
      ;

      yield put({
        type: SUBMIT_RESULT_SUCCESS,
        id,
      });
    } catch (e) {
      debugger;

      console.error(e);
      yield put({
        type: SUBMIT_RESULT_FAILURE,
        id,
      });
    }
  }
}

export function add(result) {
  return {
    type: ADD_RESULT,
    result,
  };
}

function* handleRemoveResult(getState) {
  while (true) {
    const { id } = yield take(REQUEST_REMOVE_RESULT);
    const { surveyId } = getState().results.list[id];

    yield remove({
      path: ['results'],
      name: `${surveyId}-${id}.xml`,
    });

    yield put({
      type: REMOVE_RESULT,
      id,
    });
  }
}

function* handleDuplicateResult(getState) {
  while (true) {
    const { id, newName } = yield take(REQUEST_DUPLICATE_RESULT);
    const source = getState().results.list[id];
    const newResult = {
      ...source,
      name: newName,
      id: uuid.v1(),
      submitted: false,
      createdAt: (new Date()).toISOString(),
    };

    const { surveyId } = source;

    yield copy({
      path: ['results'],
      from: `${surveyId}-${source.id}.xml`,
      to: `${surveyId}-${newResult.id}.xml`,
    });
    yield put(add(newResult));
  }
}

export const sagas = [
  handleRemoveResult,
  handleDuplicateResult,
  handleSubmit,
];
