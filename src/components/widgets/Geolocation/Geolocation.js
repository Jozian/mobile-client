import React, { Component, PropTypes } from 'react';
const { object, bool, string, func } = PropTypes;

import getLocation from 'helpers/platform/gps';

export default class Biinary extends Component {
  static propTypes = {
    config: object.isRequired,
    value: string.isRequired,
    onChange: func.isRequired,
    required: bool,
    disabled: bool,
  };

  getLocation = async () => {
    try {
      this.props.onChange('...');
      const location = await getLocation();
      this.props.onChange(`${location.latitude} ${location.longitude}`);
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    const { value = '', disabled = false } = this.props;

    return (
      <div>
        { value
          ? <input type="text" className="win-textbox" value={value} disabled readOnly />
          : null
        }
        <button onClick={this.getLocation} disabled={disabled} className="win-button">
          Get location
        </button>
      </div>
    );
  }
}
