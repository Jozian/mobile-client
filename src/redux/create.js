import { createStore, applyMiddleware, compose } from 'redux';
import createLogger from 'redux-logger';
import { syncHistory } from 'react-router-redux';
import { browserHistory } from 'react-router';
import sagaMiddleware from 'redux-saga';
import reducer, { sagas } from './modules';

const logger = createLogger({
  colors: false,
  collapsed: true,
});

export default function createAppStore(data) {
  const reduxRouterMiddleware = syncHistory(browserHistory);
  const middleware = [
    sagaMiddleware(...sagas),
    reduxRouterMiddleware,
    logger,
  ];

  const finalCreateStore = compose(
    applyMiddleware(...middleware)
  )(createStore);

  const store = finalCreateStore(reducer, data);
  reduxRouterMiddleware.listenForReplays(store);

  window.store = store;
  return store;
}
