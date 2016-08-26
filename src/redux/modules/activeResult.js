const SELECT_SURVEY = 'mdg/activeResult/SELECT_SURVEY';
const OPEN_RESULT = 'mdg/activeResult/OPEN_RESULT';
const REQUEST_OPEN_RESULT = 'mdg/activeResult/REQUEST_OPEN_RESULT';
const CREATE_RESULT = 'mdg/activeResult/CREATE_RESULT';

const REQUEST_SAVE_RESULT = 'mdg/activeResult/REQUEST_SAVE';
const SAVE_RESULT = 'mdg/activeResult/SAVE_RESULT';

import { take, put } from 'redux-saga/effects';
import { add as addResultAction, updateProgress } from '../modules/results';

import { load, save } from 'helpers/platform/fs';
import { convertXMLToSurvey, generateEmptyResponse, gatherValues } from 'helpers/resultLogic';

import { routeActions } from 'react-router-redux';
import uuid from 'uuid';

const initialState = {
  surveyId: null,
};

export default function activeResultReducer(state = initialState, action = {}) {
  switch (action.type) {
    case OPEN_RESULT:
      return {
        ...state,
        ...action.result,
        saveRequested: false,
      };
    case REQUEST_SAVE_RESULT:
      return {
        ...state,
        saveRequested: true,
      };
    case SAVE_RESULT:
      return {
        ...state,
        saveRequested: false,
      };
    case SELECT_SURVEY:
      return {
        ...state,
        surveyId: action.id,
      };
    default:
      return state;
  }
}

export function selectSurvey(id) {
  return {
    type: SELECT_SURVEY,
    id,
  };
}

export function requestOpenResult(id) {
  return {
    type: REQUEST_OPEN_RESULT,
    id,
  };
}

function* handleOpenResult(getState) {
  while (true) {
    const { id } = yield take(REQUEST_OPEN_RESULT);
    const result = getState().results.list[id];
    const { surveyId } = result;

    const survey = yield load({
      path: ['surveys'],
      name: `${surveyId}.xml`,
    });

    const resultXml = yield load({
      path: ['results'],
      name: `${surveyId}-${id}.xml`,
    });

    const structure = convertXMLToSurvey(survey);
    const initialValues = gatherValues(resultXml);

    yield put({
      type: OPEN_RESULT,
      result: {
        ...result,
        structure,
        initialValues,
        raw: resultXml,
        fields: Object.keys(initialValues),
      },
    });
    yield put(routeActions.push(`/result/${id}`));
  }
}

export function createResult(name) {
  return {
    type: CREATE_RESULT,
    name,
  };
}

function* handleCreateResult(getState) {
  while (true) {
    const { name } = yield take(CREATE_RESULT);

    const id = getState().activeResult.surveyId;
    const survey = yield load({
      path: ['surveys'],
      name: `${id}.xml`,
    });

    const emptyResponse = generateEmptyResponse(survey);

    const newId = uuid.v1();

    yield save({
      path: ['results'],
      name: `${id}-${newId}.xml`,
      content: emptyResponse,
    });

    const newResult = {
      name,
      id: newId,
      surveyId: id,
      submitted: false,
      createdAt: (new Date()).toISOString(),
    };
    yield put(addResultAction(newResult));
    yield put(requestOpenResult(newId));
  }
}

function* handleSaveResult(getState) {
  while (true) {
    const { raw, percent } = yield take(SAVE_RESULT);

    const { id, surveyId } = getState().activeResult;
    yield save({
      path: ['results'],
      name: `${surveyId}-${id}.xml`,
      content: raw,
    });
    yield put(updateProgress(id, percent));
  }
}

export function requestSaveResult() {
  return {
    type: REQUEST_SAVE_RESULT,
  };
}

export function saveResult(raw, percent) {
  return {
    type: SAVE_RESULT,
    raw,
    percent,
  };
}


export const sagas = [
  handleCreateResult,
  handleOpenResult,
  handleSaveResult,
];
