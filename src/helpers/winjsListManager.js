import WinJS from 'winjs';
import React, { Component } from 'react';
import { eq } from 'lodash';
import { diff } from 'adiff';

const wrapper = (lists) => (WrappedComponent) => {
  class ListManager extends Component {

    constructor(props) {
      super(props);
      this.state = {};
      lists.forEach(key => {
        this.state[key] = new WinJS.Binding.List(props[key]);
      });
    }

    componentWillReceiveProps(newProps) {
      const newState = {};
      lists.forEach(key => {
        const data = this.props[key];
        const list = this.state[key];
        const newData = newProps[key];
        const newDataMap = {};
        newData.forEach(item => {
          newDataMap[item.id] = item;
        });

        if (data !== newData) {
          if (!list) {
            newState[key] = new WinJS.Binding.List(newData);
          } else {
            diff(
              data.map(item => item.id),
              newData.map(item => item.id)
            ).map(diffItem =>
              diffItem.map((id, idx) =>
                idx < 2 ? id : newDataMap[id]
              )
            ).forEach(diffItem =>
              list.splice.apply(list, diffItem)
            );

            list.forEach((item, idx) => {
              if (!eq(item, newDataMap[item.id])) {
                this.state[key].setAt(idx, newDataMap[item.id]);
              }
            });
          }
        }
      });

      if (Object.keys(newState)) {
        this.setState(newState);
      }
    }

    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  }
  ListManager.dispayName = `WinJSListManager(${WrappedComponent.displayName})`;
  return ListManager;
};

export default wrapper;
