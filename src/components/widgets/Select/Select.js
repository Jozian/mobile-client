import React, { Component, PropTypes } from 'react';
const { object, bool, string, func } = PropTypes;

import styles from './Select.scss';

export default class Select extends Component {
  static propTypes = {
    config: object.isRequired,
    active: bool.isRequired,
    touched: bool.isRequired,
    value: string.isRequired,
    onChange: func.isRequired,
    required: bool,
    disabled: bool,
  };

  handleChange = () => {
    const values = Object.values(this.refs)
      .filter(n => n.checked)
      .map(n => n.value)
      .join(' ')
    ;
    this.props.onChange(values);
  }

  render() {
    const { value = '', config, disabled } = this.props;
    const values = value.split(' ');
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
        { items.map((item, idx) => (
          <label>
            <input
              className="win-checkbox"
              ref={`input-${idx}`}
              type="checkbox"
              name={id}
              value={item.value}
              disabled={disabled}
              onChange={this.handleChange}
              checked={values.indexOf(item.value) !== -1}
            />{item.label}
          </label>
        ))}
      </div>
    );
  }
}
