import { combineReducers } from 'redux';
import { routeReducer as routing } from 'react-router-redux';

import credentials, { MERGE_DATA, sagas as credentialsSagas } from './credentials';
import surveys, { sagas as surveysSagas } from './surveys';
import results, { sagas as resultSagas } from './results';
import progress from './progress';
import settings, { sagas as settingsSagas } from './settings';
import activeResult, { sagas as activeResultSagas } from './activeResult';

export default function (state, action) {
  if (action.type === MERGE_DATA) {
    return {
      ...state,
      ...action.state,
    };
  }
  return combineReducers({
    credentials,
    routing,
    surveys,
    results,
    progress,
    settings,
    activeResult,
  })(state, action);
}

export const sagas = [
  ...settingsSagas,
  ...credentialsSagas,
  ...surveysSagas,
  ...resultSagas,
  ...activeResultSagas,
];
