import client from 'superagent-es6-promise';
import noCache from 'superagent-no-cache';
import { take, put } from 'redux-saga/effects';
import { save } from 'helpers/platform/storage';

const CHECK_SERVER = 'mdg/settings/CHECK_SERVER';
const CHECK_SERVER_SUCCESS = 'mdg/settings/CHECK_SERVER_SUCCESS';
const CHECK_SERVER_FAILURE = 'mdg/settings/CHECK_SERVER_FAILURE';
const SET_VALUE = 'mdg/settings/SET_VALUE';

const initialState = {
  gpsTracking: true,
  checkSurveysAtStart: true,
  server: 'https://www.microsoftdatagathering.net',
  isServerValid: true,
  language: 'English',
};

export default function settingsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_VALUE:
      return {
        ...state,
        [action.name]: action.value,
      };
    case CHECK_SERVER:
      return {
        ...state,
        isServerValid: null,
        server: action.url,
      };
    case CHECK_SERVER_SUCCESS:
      return {
        ...state,
        isServerValid: true,
      };
    case CHECK_SERVER_FAILURE:
      return {
        ...state,
        isServerValid: false,
      };
    default:
      return state;
  }
}

export function setValue(name, value) {
  return {
    type: SET_VALUE,
    name,
    value,
  };
}

export function checkServer(url) {
  return {
    type: CHECK_SERVER,
    url,
  };
}

function* checkServerSaga() {
  while (true) {
    const { url } = yield take(CHECK_SERVER);
    try {
      const result = yield client
        .get(`${url}/CheckUrl`)
        .use(noCache)
        .promise()
      ;

      if (result.text !== 'NdgServer') {
        throw new Error('Not MDG server');
      }

      yield put({ type: CHECK_SERVER_SUCCESS });
    } catch (e) {
      console.log(e);
      yield put({ type: CHECK_SERVER_FAILURE });
    }
  }
}

function* persistSettings(getState) {
  while (true) {
    yield take([SET_VALUE, CHECK_SERVER]);
    save('settings', getState().settings);
  }
}

export const sagas = [
  persistSettings,
  checkServerSaga,
];
