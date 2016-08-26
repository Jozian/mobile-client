import { take, put } from 'redux-saga/effects';
import digest from 'helpers/digest';
import client from 'superagent-es6-promise';
import { save, remove } from 'helpers/platform/fs';

export const LOAD_SURVEYS = 'mdg/surveys/LOAD_SURVEYS';
export const LOAD_SURVEYS_SUCCESS = 'mdg/surveys/LOAD_SURVEYS_SUCCESS';
export const LOAD_SURVEYS_ERROR = 'mdg/surveys/LOAD_SURVEYS_ERROR';

export const LOAD_SURVEY = 'mdg/surveys/LOAD_SURVEY';
export const LOAD_SURVEY_SUCCESS = 'mdg/surveys/LOAD_SURVEY_SUCCESS';
export const LOAD_SURVEY_ERROR = 'mdg/surveys/LOAD_SURVEY_ERROR';

export const REQUEST_REMOVE_SURVEY = 'mdg/surveys/REQUEST_REMOVE_SURVEY';
export const REMOVE_SURVEY = 'mdg/surveys/REMOVE_SURVEY';

export const ADD_SURVEY = 'mdg/surveys/ADD_SURVEY';

const initialState = {
  list: {},
};

export default function surveysReducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_SURVEY: {
      const { id, name } = action;
      return {
        ...state,
        list: {
          ...state.list,
          [id]: {
            id,
            name,
            time: (new Date()).toISOString(),
          },
        },
      };
    }
    case REMOVE_SURVEY: {
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

export function add(data) {
  return {
    type: ADD_SURVEY,
    ...data,
  };
}

export function list() {
  return {
    type: LOAD_SURVEYS,
  };
}

export function requestRemove(id) {
  return {
    type: REQUEST_REMOVE_SURVEY,
    id,
  };
}

function* removeSurvey() {
  while (true) {
    const { id } = yield take(REQUEST_REMOVE_SURVEY);
    yield remove({
      path: ['surveys'],
      name: `${id}.xml`,
    });
    yield put({ type: REMOVE_SURVEY, id });
  }
}

function* loadSurveys(getState) {
  while (true) {
    yield take(LOAD_SURVEYS);
    try {
      const { url, login, password } = getState().credentials;
      const path = `/ReceiveSurvey?dc=${Math.random().toString(36).substr(2)}`;
      const auth = digest('GET', path, `${login}:${password}`);

      const result = yield client
        .get(`${url}${path}`)
        .set('Authorization', auth)
        .promise()
      ;
      const oParser = new DOMParser();
      const doc = oParser.parseFromString(result.text, 'text/xml');
      const surveys = Array.from(doc.querySelectorAll('xform')).map(
        node => ({
          url: node.querySelector('downloadUrl').textContent,
          formID: node.querySelector('formID').textContent,
          name: node.querySelector('name').textContent,
        })
      );

      for (const survey of surveys) {
        const parser = document.createElement('a');
        parser.href = survey.url;
        const pathname = parser.pathname[0] === '/' ? parser.pathname : `/${parser.pathname}`;
        const surveyAuth = digest('GET', pathname, `${login}:${password}`);
        const surveyData = yield client
          .get(survey.url)
          .set('Authorization', surveyAuth)
          .promise();

        save({
          path: ['surveys'],
          content: surveyData.text,
          name: `${survey.formID}.xml`,
        });

        yield put({
          type: ADD_SURVEY,
          id: survey.formID,
          name: survey.name,
        });
      }
      yield put({ type: LOAD_SURVEYS_SUCCESS });
    } catch (e) {
      console.log(e);
      yield put({ type: LOAD_SURVEYS_ERROR });
    }
  }
}

export const sagas = [
  loadSurveys,
  removeSurvey,
];
