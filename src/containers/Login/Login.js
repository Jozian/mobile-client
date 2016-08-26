import React, { Component, PropTypes } from 'react';
const { func, bool, string } = PropTypes;
import cx from 'classnames';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

import { login } from 'redux/modules/credentials';

import styles from './Login.scss';

class Login extends Component {
  static propTypes = {
    login: func.isRequired,
    isLoggedIn: bool.isRequired,
    server: string.isRequired,
    replacePath: func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      acceptedTOS: false,
    };

    if (props.isLoggedIn) {
      props.replacePath('/');
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.isLoggedIn) {
      this.props.replacePath('/');
    }
  }

  onTOSClick() {
    this.setState({
      acceptedTOS: !this.state.acceptedTOS,
    });
  }

  handleSubmit = e => {
    const { login: iLogin, password: iPassword } = e.target.elements;
    const credentials = ({
      login: iLogin.value,
      password: iPassword.value,
      server: this.props.server,
    });
    e.preventDefault();
    this.props.login(credentials);
  };

  render() {
    return (
      <div className={styles.root}>
        <img src="/images/applogo.png" />
        <form onSubmit={::this.handleSubmit}>
          <input
            type="text"
            className={cx('win-textbox', styles.input)}
            name="login"
            placeholder="User name"
            autoFocus
          />
          <input
            type="password"
            className={cx('win-textbox', styles.input)}
            name="password"
            placeholder="Password"
          />
          <button
            disabled={!this.state.acceptedTOS}
            className={cx('win-button', styles.input)}
          >
            Login
          </button>
          <p className={styles.checkbox}>
            <input
              type="checkbox"
              className="win-checkbox"
              checked={this.state.acceptedTOS}
              onChange={::this.onTOSClick}
            />
            I accept <a target="_blank" href="http://www.microsoft.com/mobile/privacypolicy">Privacy Policy</a> and <a target="_blank" href="http://www.microsoft.com/mobile/serviceterms">Service Terms</a>
          </p>
        </form>
      </div>

    );
  }
}

export default connect(
  ({ credentials, settings }) => ({ isLoggedIn: !!credentials.login, server: settings.server }),
  { login, replacePath: routeActions.replace }
)(Login);
