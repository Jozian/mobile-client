import React, { Component } from 'react';
const { node, object } = React.PropTypes;

export default class HistoryWrapper extends Component {
  static propTypes = {
    children: node.isRequired,
    history: object,
  };

  static childContextTypes = {
    history: object,
  };

  getChildContext() {
    const { history } = this.props;
    return { history };
  }

  render() {
    return this.props.children;
  }
}
