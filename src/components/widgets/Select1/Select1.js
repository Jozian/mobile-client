import React, { Component, PropTypes } from 'react';
const { object, bool, string } = PropTypes;
// import cx from 'classnames';

import styles from './Select1.scss';

export default class Select1 extends Component {
  static propTypes = {
    config: object.isRequired,
    active: bool.isRequired,
    touched: bool.isRequired,
    value: string.isRequired,
    required: bool,
  };

  render() {
    const { value = '', config } = this.props;
    const { required, items, id } = config;
    const invalid = required && !value.length;
    const messages = [];

    // const className = cx({
    //   'win-textbox': true,
    //   [sharedStyles.invalid]: !active && touched && invalid,
    //   [sharedStyles.valid]: !active && touched && !invalid,
    // });
    //
    if (required && invalid) {
      messages.push('This question is required');
    }

    return (
      <div className={styles.Select1}>
        { items.map(item => (
          <label>
            <input
              className="win-radio"
              type="radio"
              {...this.props}
              name={id}
              value={item.value}
              checked={value === item.value}
            />{item.label}
          </label>
        ))}
      </div>
    );
  }
}
