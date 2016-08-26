import React, { Component, PropTypes } from 'react';
const { func, node } = PropTypes;
import { connect } from 'react-redux';

import { list as listSurveys } from 'redux/modules/surveys';

import styles from './Main.scss';

class Main extends Component {
  static propTypes = {
    listSurveys: func.isRequired,
    children: node,
  };

  render() {
    return <div className={styles.main}>{this.props.children}</div>;
  }
}

export default connect(
  () => ({}),
  { listSurveys }
)(Main);
