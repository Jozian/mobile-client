import React, { Component, PropTypes } from 'react';
import cameraPlugin from 'helpers/platform/cameraPlugin';

const { object, bool, string, func } = PropTypes;

import { takePicture, close } from 'helpers/platform/camera';

export default class Biinary extends Component {
  static propTypes = {
    config: object.isRequired,
    value: string.isRequired,
    onChange: func.isRequired,
    required: bool,
    disabled: bool,
  };

  takePhoto = () => {
    cameraPlugin(img => {
      this.props.onChange(img);
    }, err => {
      console.log(err);
    }, []);
  };

  clickFile = () => {
    this.refs.file.click();
  };

  uploadFile = () => {
    const file = this.refs.file.files[0];
    const reader = new FileReader();
    reader.onloadend = () => this.props.onChange(reader.result);
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  render() {
    const { value = '', disabled = false } = this.props;
    const imageSrc = (value.length && value.substring(0, 4) !== 'data')
      ? `data:image/jpg;base64,${value}`
      : value
    ;
    return (
      <div>
        { value ? <div><img src={imageSrc} /></div> : null}
        <button onClick={this.takePhoto} disabled={disabled} className="win-button">
          Take a photo
        </button>
        &nbsp;
        <button onClick={this.clickFile} disabled={disabled} className="win-button">
          Upload file
        </button>
        <input hidden type="file" ref="file" onChange={this.uploadFile} />
      </div>
    );
  }
}
