import React, { Component, PropTypes } from 'react';
const { array } = PropTypes;
import sharedStyles from './shared.scss';

export default class Messages extends Component {
  static propTypes = {
    messages: array,
  };

  render() {
    const { messages } = this.props;
    if (!messages.length) {
      return null;
    }

    return (<ul className={sharedStyles.messages}>
      { messages.map(m => <li>{m}</li>) }
    </ul>);
  }
}
