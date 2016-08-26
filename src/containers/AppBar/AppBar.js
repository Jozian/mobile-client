import React, { Component, PropTypes } from 'react';
const { string, func, bool } = PropTypes;
import { connect } from 'react-redux';
import { AppBar } from 'react-winjs';
import { routeActions } from 'react-router-redux';

import { list as listSurveys } from 'redux/modules/surveys';
import { logout } from 'redux/modules/credentials';
import { createResult, requestSaveResult } from 'redux/modules/activeResult';

import { prompt as promptUi } from 'helpers/platform/ui';


class DynamicAppBar extends Component {
  static propTypes = {
    path: string.isRequired,
    listSurveys: func.isRequired,
    logout: func.isRequired,
    pushUrl: func.isRequired,
    isLoggedIn: bool.isRequired,
    createResult: func.isRequired,
    requestSaveResult: func.isRequired,
  };

  goToSettings = () => {
    this.props.pushUrl('/settings');
  };

  logout = () => {
    this.props.logout();
    this.props.pushUrl('/login');
  };

  createNewResponse = () => {
    promptUi('Name your response').then(name => {
      this.props.createResult(name);
    }, () => {});
  };

  render() {
    const { path, isLoggedIn } = this.props;

    return (
      <AppBar closedDisplayMode="full">
        {
          path !== '/settings' ?
            <AppBar.Button
              key="settings"
              icon="settings"
              label="Settings"
              onClick={this.goToSettings}
            />
          : null
        }
        {
          path === '/' ?
            <AppBar.Button
              key="syncAppBar"
              icon="refresh"
              label="Sync"
              onClick={this.props.listSurveys}
            />
            : null
        }
        {
          path.startsWith('/survey/') ?
            <AppBar.Button
              key="addResult"
              icon="add"
              label="Add"
              onClick={this.createNewResponse}
            />
            : null
        }
        {
          path.startsWith('/result/') ?
            <AppBar.Button
              key="saveResult"
              icon="save"
              label="Save"
              onClick={this.props.requestSaveResult}
            />
            : null
        }
        {
          path === '/settings' && isLoggedIn ?
            <AppBar.Button
              key="logout"
              icon="setlockscreen"
              label="Logout"
              onClick={this.logout}
            />
            : null
        }
      </AppBar>
    );
  }
}

export default connect(
  ({ routing, credentials }) => ({
    path: routing.location.pathname,
    isLoggedIn: !!credentials.login,
  }),
  { listSurveys, pushUrl: routeActions.push, logout, createResult, requestSaveResult }
)(DynamicAppBar);
