import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { ProgressBar } from 'components';
import { AppBar } from 'containers';

import styles from './App.scss';

class App extends Component {
  static propTypes = {
    children: PropTypes.node,
    isInProgress: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <div className={styles.root}>
        <ProgressBar inProgress={this.props.isInProgress} />
        <div className={styles.container}>
          { this.props.children }
        </div>
        <AppBar />
      </div>
    );
  }
}

export default connect(
  ({ progress }) => ({ isInProgress: !!progress.pending })
)(App);
