import WinJS from 'winjs';
import React, { Component, PropTypes } from 'react';
import { ListView } from 'react-winjs';

import styles from './List.scss';

export default class ResizableListView extends Component {

  static propTypes = {
    onItemInvoked: PropTypes.func.isRequired,
    list: PropTypes.object.isRequired,
  };

  componentDidMount() {
    window.addEventListener('resize', this.resizeHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  layout = new WinJS.UI.GridLayout(
    { orientation: 'vertical' }
  );

  resizeHandler = () => {
    if (this.refs.list) {
      this.refs.list.winControl.forceLayout();
    }
  };

  render() {
    return this.props.list.length
      ? <ListView
        layout={this.layout}
        {...this.props}
        itemDataSource={this.props.list.dataSource}
        ref="list"
      />
      : <div className={styles.center}>No data to display</div>
    ;
  }
}
