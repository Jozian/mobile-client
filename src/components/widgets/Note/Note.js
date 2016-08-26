import React, { Component, PropTypes } from 'react';
const { object, string } = PropTypes;

export default class Note extends Component {
  static propTypes = {
    config: object.isRequired,
    value: string.isRequired,
  };

  render() {
    return (
      <div></div>
    );
  }
}
