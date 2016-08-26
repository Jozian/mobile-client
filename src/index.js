/* global Windows */
import './shim';
import React from 'react';
import WinJS from 'winjs';
import 'winjs/css/ui-light.css';

import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

import createStore from 'redux/create';
import { App, AuthorizedArea, Login, Main, Home, Settings, Survey, Result } from 'containers';

import { load as loadCredentials } from 'helpers/platform/credentials';
import { load as loadFromStorage } from 'helpers/platform/storage';
import { setActiveFolder } from 'helpers/platform/fs';

import Perf from 'react-addons-perf';
window.Perf = Perf;

browserHistory.replace({}, '', '/');

const app = WinJS.Application;
async function launchApp() {
  const settings = loadFromStorage('settings');
  const credentials = await loadCredentials();
  const initialData = {
    settings: settings || undefined,
    credentials: credentials || undefined,
  };

  if (credentials && credentials.url) {
    setActiveFolder(`${credentials.url.replace(/\W/g, '')}-${credentials.login}`);
  }

  const store = createStore(initialData);

  ReactDOM.render(
    <Provider store={store} key="provider">
      <Router history={browserHistory}>
        <Route component={App}>
          <Route path="/" component={AuthorizedArea}>
            <Route component={Main}>
              <IndexRoute component={Home} />
              <Route path="/survey/:surveyId" component={Survey} />
              <Route path="/result/:resultId" component={Result} />
            </Route>
          </Route>
          <Route path="login" component={Login} />
          <Route path="settings" component={Settings} />
        </Route>
      </Router>
    </Provider>,
    document.querySelector('#content')
  );
}

if (window.Windows) {
  const activation = Windows.ApplicationModel.Activation;

  app.onbackclick = () => {
    debugger;
    browserHistory.goBack();
    return true;
  };

  app.onactivated = (args) => {
    if (args.detail.kind === activation.ActivationKind.launch) {
      if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
        args.setPromise(launchApp());
      }
    }
  };

  app.start();
} else {
  app.start();
  window.launchApp = launchApp;
}
