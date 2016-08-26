/* global MSGesture */
import { Component, PropTypes, Children, cloneElement } from 'react';
const { node, func } = PropTypes;

export default class LongTapWrapper extends Component {

  static propTypes = {
    onLongTap: func.isRequired,
    children: node.isRequired,
  };

  componentDidMount() {
    /* global MSGesture */
    const target = this.refs.component;
    const gestureObject = new MSGesture();
    gestureObject.target = target;
    target.gestureObject = gestureObject;
    target.addEventListener('pointerdown', e => {
      gestureObject.target = target;
      gestureObject.addPointer(e.pointerId);
    });
    target.addEventListener('MSGestureHold', async e => {
      await this.props.onLongTap(e);
    });
  }

  onContextMenu = async e => {
    await this.props.onLongTap(e);
  };

  render() {
    const child = Children.only(this.props.children);
    return cloneElement(child, { ref: 'component', onContextMenu: this.onContextMenu });
  }
}
