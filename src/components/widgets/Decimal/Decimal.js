import React, { Component, PropTypes } from 'react';
const { object, bool, string, func } = PropTypes;
import cx from 'classnames';

import sharedStyles from '../shared.scss';

export default class Int extends Component {
  static propTypes = {
    config: object.isRequired,
    active: bool.isRequired,
    touched: bool.isRequired,
    value: string.isRequired,
    onChange: func.isRequired,
    required: bool,
  };

  handleChange = (e) => {
    const value = e.target.value;
    if (!isNaN(Number(value))) {
      console.log(value);
      this.props.onChange(value);
    }
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
        <input className={className} type="integer" {...this.props} onChange={this.handleChange} />
        { messages.map(m => <span>{m}</span>)}
      </div>
    );
  }
}
