import { LOGIN, LOGIN_SUCCESS, LOGIN_FAILURE } from './credentials';
import { LOAD_SURVEYS, LOAD_SURVEYS_SUCCESS, LOAD_SURVEYS_FAILURE } from './surveys';

const initialState = {
  pending: 0,
};

export default function progressReducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN:
    case LOAD_SURVEYS:
      return {
        ...state,
        pending: state.pending + 1,
      };
    case LOGIN_SUCCESS:
    case LOGIN_FAILURE:
    case LOAD_SURVEYS_SUCCESS:
    case LOAD_SURVEYS_FAILURE:
      return {
        ...state,
        pending: Math.max(state.pending - 1, 0),
      };
    default:
      return state;
  }
}
