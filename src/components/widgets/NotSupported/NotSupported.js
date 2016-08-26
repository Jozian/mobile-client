import React, { Component, PropTypes } from 'react';
export default class NotSupported extends Component {
  static propTypes = {
    config: PropTypes.object,
  };

  render() {
    return (
      <div>
        <h3>This question type is not yet supported {this.props.config.type}</h3>
      </div>
    );
  }
}
