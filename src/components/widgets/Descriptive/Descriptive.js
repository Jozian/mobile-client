import React, { Component, PropTypes } from 'react';
const { object, bool, string } = PropTypes;
import Messages from '../Messages';

import cx from 'classnames';

import styles from './Descriptive.scss';
import sharedStyles from '../shared.scss';

export default class Descriptive extends Component {
  static propTypes = {
    config: object.isRequired,
    active: bool.isRequired,
    touched: bool.isRequired,
    value: string.isRequired,
    required: bool,
  };

  checkConstraint = () => {
  }

  render() {
    const { active, touched, value = '', config } = this.props;
    const { constraint, required } = config;
    const additionalProps = {};
    const invalid = required && !value.length;
    const messages = [];

    const className = cx({
      'win-textbox': true,
      [sharedStyles.invalid]: !active && touched && invalid,
      [sharedStyles.valid]: !active && touched && !invalid,
    });

    if (constraint && constraint.startsWith('string-length( . ) <= ')) {
      const length = constraint.replace('string-length( . ) <= ', '').trim();
      additionalProps.maxLength = length.toString();
      messages.push(`Must contain no more than ${length} characters`);
    }

    if (required && !value.length) {
      messages.push('This question is required');
    }

    return (
      <div className={styles.Descriptive}>
        <input className={className} type="text" {...this.props} {...additionalProps} />
        { active || invalid ? <Messages messages={messages} /> : null }
      </div>
    );
  }
}
