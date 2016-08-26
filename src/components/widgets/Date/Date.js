import React, { Component, PropTypes } from 'react';
const { object, bool, string } = PropTypes;
import cx from 'classnames';

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
    const { required } = config;
    const invalid = required && !value.length;
    const messages = [];

    const className = cx({
      'win-textbox': true,
      [sharedStyles.invalid]: !active && touched && invalid,
      [sharedStyles.valid]: !active && touched && !invalid,
    });

    if (required && invalid) {
      messages.push('This question is required');
    }

    return (
      <div>
        <input className={className} type="date" {...this.props} />
        { messages.map(m => <span>{m}</span>)}
      </div>
    );
  }
}
