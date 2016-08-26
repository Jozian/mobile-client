import { Component, PropTypes } from 'react';
const { bool, func, node } = PropTypes;
import { routeActions } from 'react-router-redux';
import { connect } from 'react-redux';

class AuthorizedArea extends Component {
  static propTypes = {
    isLoggedIn: bool.isRequired,
    replacePath: func.isRequired,
    children: node,
  };

  componentWillMount() {
    if (!this.props.isLoggedIn) {
      this.props.replacePath('/login');
    }
  }

  componentWillReceiveProps(newProps) {
    if (!newProps.isLoggedIn) {
      this.props.replacePath('/login');
    }
  }

  render() {
    return this.props.isLoggedIn ? this.props.children : null;
  }
}

export default connect(
  ({ credentials }) => ({ isLoggedIn: !!credentials.login }),
  { replacePath: routeActions.replace }
)(AuthorizedArea);
