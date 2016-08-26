import client from 'superagent-es6-promise';
import { take, put } from 'redux-saga/effects';
import { save as saveCredentials } from 'helpers/platform/credentials';
import {
  save as saveToFs,
  load as loadFromFs,
  setActiveFolder,
} from 'helpers/platform/fs';
import digest from 'helpers/digest';

export const LOGIN = 'mdg/credentials/LOGIN';
export const LOGIN_SUCCESS = 'mdg/credentials/LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'mdg/credentials/LOGIN_FAILURE';
const LOGOUT = 'mdg/credentials/LOGOUT';
export const MERGE_DATA = 'mdg/credentials/MERGE_DATA';

const initialState = {
  login: null,
  password: null,
  url: null,
};

export default function credentialsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        ...action.credentials,
      };
    case LOGOUT: {
      return {
        ...state,
        ...initialState,
      };
    }
    case LOGIN_FAILURE:
      return {
        ...state,
        url: null,
      };
    default:
      return state;
  }
}

export function login({ login: user, password, server }) {
  return {
    type: LOGIN,
    credentials: { login: user, password, url: server },
  };
}

export function logout() {
  return {
    type: LOGOUT,
  };
}

function* performLogin() {
  while (true) {
    const { credentials } = yield take(LOGIN);
    const path = `/checkAuthorization?use400=1&${Math.random()}`;
    const auth = digest('GET', path, `${credentials.login}:${credentials.password}`);
    try {
      yield client
        .get(`${credentials.url}${path}`)
        .set('Authorization', auth)
        .promise()
      ;
      setActiveFolder(`${credentials.url.replace(/\W/g, '')}-${credentials.login}`);
      yield put({ type: LOGIN_SUCCESS, credentials });
    } catch (e) {
      console.error(e);
      yield put({ type: LOGIN_FAILURE, credentials });
    }
  }
}

function* persistCredentials() {
  while (true) {
    const nextAction = yield take(LOGIN_SUCCESS);
    yield saveCredentials(nextAction.credentials);
  }
}

function* clearCredentials() {
  while (true) {
    yield take(LOGOUT);
    setActiveFolder(null);
    yield saveCredentials(null);
  }
}

function* loadState(getState) {
  if (getState().credentials.url) {
    try {
      const stateData = JSON.parse(yield loadFromFs({
        path: [],
        name: 'data.json',
      }));
      yield put({ type: MERGE_DATA, state: stateData });
    } catch (e) {
      console.log('No saved data found');
    }
  }
  while (true) {
    yield take(LOGIN_SUCCESS);
    try {
      const stateData = JSON.parse(yield loadFromFs({
        path: [],
        name: 'data.json',
      }));
      yield put({ type: MERGE_DATA, state: stateData });
    } catch (e) {
      yield put({
        type: MERGE_DATA,
        state: {
          surveys: { list: {} },
          results: { list: {} },
        },
      });
    }
  }
}

function* saveState(getState) {
  while (true) {
    const action = yield take();
    if (
      action.type.startsWith('@@router')
      || action.type === LOGOUT
      || action.type === LOGIN_SUCCESS
      || !getState().credentials.login
    ) { continue; }
    const { surveys, results } = getState();
    yield saveToFs({
      path: [],
      content: JSON.stringify({ surveys, results }),
      name: 'data.json',
    });
  }
}

export const sagas = [
  persistCredentials,
  clearCredentials,
  performLogin,
  loadState,
  saveState,
];
