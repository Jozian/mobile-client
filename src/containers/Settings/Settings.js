import React, { Component, PropTypes } from 'react';
import { ToggleSwitch } from 'react-winjs';
const { bool, func, string } = PropTypes;
import { connect } from 'react-redux';

import { setValue, checkServer } from 'redux/modules/settings';

import { Header } from 'components';
import cx from 'classnames';

import styles from './Settings.scss';

class Settings extends Component {
  static propTypes = {
    isServerValid: bool,
    gpsTracking: bool.isRequired,
    checkSurveysAtStart: bool.isRequired,
    server: string.isRequired,
    language: string.isRequired,
    setValue: func.isRequired,
    checkServer: func.isRequired,
  };

  onToggleChange = name => e => {
    this.props.setValue(name, e.currentTarget.winControl.checked);
  };

  onServerInputChange = e => {
    this.props.checkServer(e.target.value);
  };

  render() {
    const { isServerValid, gpsTracking, checkSurveysAtStart, server } = this.props;

    return (
      <div className={styles.settings}>
        <Header title="settings" />
        <div className={styles.content}>
          <ToggleSwitch
            name="allowGps"
            labelOn="Allow GPS tracking"
            labelOff="Allow GPS tracking"
            onChange={this.onToggleChange('gpsTracking')}
            checked={gpsTracking}
          />
          <ToggleSwitch
            name="checkSurveysAtStart"
            labelOn="Check for new surveys at start"
            labelOff="Check for new surveys at start"
            onChange={this.onToggleChange('checkSurveysAtStart')}
            checked={checkSurveysAtStart}
          />
          <label htmlFor="server">
            Server address
          </label>
          <input
            id="server"
            type="text"
            className={cx({
              'win-textbox': true,
              [styles.valid]: isServerValid === true,
              [styles.invalid]: isServerValid === false,
            })}
            defaultValue={server}
            onBlur={this.onServerInputChange}
          />
          <label htmlFor="language">
            Language
          </label>
          <select id="language" className="win-dropdown">
            <option value="en">English</option>
          </select>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ settings }) => ({ ...settings }),
  { setValue, checkServer }
)(Settings);
