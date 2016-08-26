import React, { Component, PropTypes } from 'react';
const { object, bool, string } = PropTypes;

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
    const { required, items } = config;
    const invalid = required && !value.length;
    const messages = [];

    if (required && invalid) {
      messages.push('This question is required');
    }

    return (
      <select placeholder="Pick one" className="win-dropdown" {...this.props}>
        <option value="" disabled selected={!this.value} hidden>Pick one</option>
        { items.map(item => (
          <option value={item.value}>{item.label}</option>
        ))}
      </select>
    );
  }
}
