const HIGHEST_POSSIBLE_Z_INDEX = 10000;
const OptUnique = Windows.Storage.CreationCollisionOption.generateUniqueName;
const CapMSType = Windows.Media.Capture.MediaStreamType;
const DEFAULT_ASPECT_RATIO = '1.8';
const getAppData = function () {
    return Windows.Storage.ApplicationData.current;
};

async function savePhoto(photo) {
  const stream = await photo.openAsync(Windows.Storage.FileAccessMode.read);
  const size = stream.size;
  const inputStream = stream.getInputStreamAt(0);
  const reader = new Windows.Storage.Streams.DataReader(inputStream);
  await reader.loadAsync(size);
  const buffer = reader.readBuffer(size);
  const base64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
  return base64;
}

export default function takePictureFromCameraWP(successCallback, errorCallback, args) {
    // We are running on WP8.1 which lacks CameraCaptureUI class
    // so we need to use MediaCapture class instead and implement custom UI for camera
    var destinationType = args[1],
        targetWidth = args[3] || 300,
        targetHeight = args[4] || 300,
        encodingType = args[5],
        saveToPhotoAlbum = args[9],
        cameraDirection = args[11],
        capturePreview = null,
        cameraCaptureButton = null,
        cameraCancelButton = null,
        capture = null,
        captureSettings = null,
        CaptureNS = Windows.Media.Capture,
        sensor = null;

    function createCameraUI() {
        // create style for take and cancel buttons
        var buttonStyle = "width:45%;padding: 10px 16px;font-size: 18px;line-height: 1.3333333;color: #333;background-color: #fff;border-color: #ccc; border: 1px solid transparent;border-radius: 6px; display: block; margin: 20px; z-index: 1000;border-color: #adadad;";

        // Create fullscreen preview
        // z-order style element for capturePreview and cameraCancelButton elts
        // is necessary to avoid overriding by another page elements, -1 sometimes is not enough
        capturePreview = document.createElement("video");
        capturePreview.style.cssText = "position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: " + (HIGHEST_POSSIBLE_Z_INDEX - 1) + ";";

        // Create capture button
        cameraCaptureButton = document.createElement("button");
        cameraCaptureButton.innerText = "Take";
        cameraCaptureButton.style.cssText = buttonStyle + "position: fixed; left: 0; bottom: 0; margin: 20px; z-index: " + HIGHEST_POSSIBLE_Z_INDEX + ";";

        // Create cancel button
        cameraCancelButton = document.createElement("button");
        cameraCancelButton.innerText = "Cancel";
        cameraCancelButton.style.cssText = buttonStyle + "position: fixed; right: 0; bottom: 0; margin: 20px; z-index: " + HIGHEST_POSSIBLE_Z_INDEX + ";";

        capture = new CaptureNS.MediaCapture();

        captureSettings = new CaptureNS.MediaCaptureInitializationSettings();
        captureSettings.streamingCaptureMode = CaptureNS.StreamingCaptureMode.video;
    }

    function continueVideoOnFocus() {
        // if preview is defined it would be stuck, play it
        if (capturePreview) {
            capturePreview.play();
        }
    }

    function startCameraPreview() {
        // Search for available camera devices
        // This is necessary to detect which camera (front or back) we should use
        var DeviceEnum = Windows.Devices.Enumeration;
        var expectedPanel = cameraDirection === 1 ? DeviceEnum.Panel.front : DeviceEnum.Panel.back;

        // Add focus event handler to capture the event when user suspends the app and comes back while the preview is on
        window.addEventListener("focus", continueVideoOnFocus);

        DeviceEnum.DeviceInformation.findAllAsync(DeviceEnum.DeviceClass.videoCapture).then(function (devices) {
            if (devices.length <= 0) {
                destroyCameraPreview();
                errorCallback('Camera not found');
                return;
            }

            devices.forEach(function(currDev) {
                if (currDev.enclosureLocation.panel && currDev.enclosureLocation.panel == expectedPanel) {
                    captureSettings.videoDeviceId = currDev.id;
                }
            });

            captureSettings.photoCaptureSource = Windows.Media.Capture.PhotoCaptureSource.photo;

            return capture.initializeAsync(captureSettings);
        }).then(function () {

            // create focus control if available
            var VideoDeviceController = capture.videoDeviceController;
            var FocusControl = VideoDeviceController.focusControl;

            if (FocusControl.supported === true) {
                capturePreview.addEventListener('click', function () {
                    // Make sure function isn't called again before previous focus is completed
                    if (this.getAttribute('clicked') === '1') {
                        return false;
                    } else {
                        this.setAttribute('clicked', '1');
                    }
                    var preset = Windows.Media.Devices.FocusPreset.autoNormal;
                    var parent = this;
                    FocusControl.setPresetAsync(preset).done(function () {
                        // set the clicked attribute back to '0' to allow focus again
                        parent.setAttribute('clicked', '0');
                    });
                });
            }

            // msdn.microsoft.com/en-us/library/windows/apps/hh452807.aspx
            capturePreview.msZoom = true;
            capturePreview.src = URL.createObjectURL(capture);
            capturePreview.play();

            // Bind events to controls
            sensor = Windows.Devices.Sensors.SimpleOrientationSensor.getDefault();
            if (sensor !== null) {
                sensor.addEventListener("orientationchanged", onOrientationChange);
            }

            // add click events to capture and cancel buttons
            cameraCaptureButton.addEventListener('click', onCameraCaptureButtonClick);
            cameraCancelButton.addEventListener('click', onCameraCancelButtonClick);

            // Change default orientation
            if (sensor) {
                setPreviewRotation(sensor.getCurrentOrientation());
            } else {
                setPreviewRotation(Windows.Graphics.Display.DisplayInformation.getForCurrentView().currentOrientation);
            }

            // Get available aspect ratios
            var aspectRatios = getAspectRatios(capture);

            // Couldn't find a good ratio
            if (aspectRatios.length === 0) {
                destroyCameraPreview();
                errorCallback('There\'s not a good aspect ratio available');
                return;
            }

            // add elements to body
            document.body.appendChild(capturePreview);
            document.body.appendChild(cameraCaptureButton);
            document.body.appendChild(cameraCancelButton);

            if (aspectRatios.indexOf(DEFAULT_ASPECT_RATIO) > -1) {
                return setAspectRatio(capture, DEFAULT_ASPECT_RATIO);
            } else {
                // Doesn't support 16:9 - pick next best
                return setAspectRatio(capture, aspectRatios[0]);
            }
        }).done(null, function (err) {
            destroyCameraPreview();
            errorCallback('Camera intitialization error ' + err);
        });
    }

    function destroyCameraPreview() {
        // If sensor is available, remove event listener
        if (sensor !== null) {
            sensor.removeEventListener('orientationchanged', onOrientationChange);
        }

        // Pause and dispose preview element
        capturePreview.pause();
        capturePreview.src = null;

        // Remove event listeners from buttons
        cameraCaptureButton.removeEventListener('click', onCameraCaptureButtonClick);
        cameraCancelButton.removeEventListener('click', onCameraCancelButtonClick);

        // Remove the focus event handler
        window.removeEventListener("focus", continueVideoOnFocus);

        // Remove elements
        [capturePreview, cameraCaptureButton, cameraCancelButton].forEach(function (elem) {
            if (elem /* && elem in document.body.childNodes */) {
                document.body.removeChild(elem);
            }
        });

        // Stop and dispose media capture manager
        if (capture) {
            capture.stopRecordAsync();
            capture = null;
        }
    }

    function captureAction() {

        var encodingProperties,
            fileName,
            tempFolder = getAppData().temporaryFolder;


        fileName = 'photo.jpg';
        encodingProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createJpeg();


        tempFolder.createFileAsync(fileName, OptUnique)
            .then(function(tempCapturedFile) {
                return new WinJS.Promise(function (complete) {
                    var photoStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
                    var finalStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
                    capture.capturePhotoToStreamAsync(encodingProperties, photoStream)
                        .then(function() {
                            return Windows.Graphics.Imaging.BitmapDecoder.createAsync(photoStream);
                        })
                        .then(function(dec) {
                            finalStream.size = 0; // BitmapEncoder requires the output stream to be empty
                            return Windows.Graphics.Imaging.BitmapEncoder.createForTranscodingAsync(finalStream, dec);
                        })
                        .then(function(enc) {
                            // We need to rotate the photo wrt sensor orientation
                            enc.bitmapTransform.rotation = orientationToRotation(sensor.getCurrentOrientation());
                            return enc.flushAsync();
                        })
                        .then(function() {
                            return tempCapturedFile.openAsync(Windows.Storage.FileAccessMode.readWrite);
                        })
                        .then(function(fileStream) {
                            return Windows.Storage.Streams.RandomAccessStream.copyAndCloseAsync(finalStream, fileStream);
                        })
                        .done(function() {
                            photoStream.close();
                            finalStream.close();
                            complete(tempCapturedFile);
                        }, function() {
                            photoStream.close();
                            finalStream.close();
                            throw new Error("An error has occured while capturing the photo.");
                        });
                });
            })
            .done(async function(capturedFile) {
                destroyCameraPreview();
                try {
                  const img = await savePhoto(capturedFile);
                  successCallback(img)
                } catch (e) {
                  errorCallback(err);
                }
            }, function(err) {
                destroyCameraPreview();
                errorCallback(err);
            });
    }

    function getAspectRatios(capture) {
        var videoDeviceController = capture.videoDeviceController;
        var photoAspectRatios = videoDeviceController.getAvailableMediaStreamProperties(CapMSType.photo).map(function (element) {
            return (element.width / element.height).toFixed(1);
        }).filter(function (element, index, array) { return (index === array.indexOf(element)); });

        var videoAspectRatios = videoDeviceController.getAvailableMediaStreamProperties(CapMSType.videoRecord).map(function (element) {
            return (element.width / element.height).toFixed(1);
        }).filter(function (element, index, array) { return (index === array.indexOf(element)); });

        var videoPreviewAspectRatios = videoDeviceController.getAvailableMediaStreamProperties(CapMSType.videoPreview).map(function (element) {
            return (element.width / element.height).toFixed(1);
        }).filter(function (element, index, array) { return (index === array.indexOf(element)); });

        var allAspectRatios = [].concat(photoAspectRatios, videoAspectRatios, videoPreviewAspectRatios);

        var aspectObj = allAspectRatios.reduce(function (map, item) {
            if (!map[item]) {
                map[item] = 0;
            }
            map[item]++;
            return map;
        }, {});

        return Object.keys(aspectObj).filter(function (k) {
            return aspectObj[k] === 3;
        });
    }

    function setAspectRatio(capture, aspect) {
        // Max photo resolution with desired aspect ratio
        var videoDeviceController = capture.videoDeviceController;
        var photoResolution = videoDeviceController.getAvailableMediaStreamProperties(CapMSType.photo)
            .filter(function (elem) {
                return ((elem.width / elem.height).toFixed(1) === aspect);
            })
            .reduce(function (prop1, prop2) {
                return (prop1.width * prop1.height) > (prop2.width * prop2.height) ? prop1 : prop2;
            });

        // Max video resolution with desired aspect ratio
        var videoRecordResolution = videoDeviceController.getAvailableMediaStreamProperties(CapMSType.videoRecord)
            .filter(function (elem) {
                return ((elem.width / elem.height).toFixed(1) === aspect);
            })
            .reduce(function (prop1, prop2) {
                return (prop1.width * prop1.height) > (prop2.width * prop2.height) ? prop1 : prop2;
            });

        // Max video preview resolution with desired aspect ratio
        var videoPreviewResolution = videoDeviceController.getAvailableMediaStreamProperties(CapMSType.videoPreview)
            .filter(function (elem) {
                return ((elem.width / elem.height).toFixed(1) === aspect);
            })
            .reduce(function (prop1, prop2) {
                return (prop1.width * prop1.height) > (prop2.width * prop2.height) ? prop1 : prop2;
            });

        return videoDeviceController.setMediaStreamPropertiesAsync(CapMSType.photo, photoResolution)
            .then(function () {
                return videoDeviceController.setMediaStreamPropertiesAsync(CapMSType.videoPreview, videoPreviewResolution);
            })
            .then(function () {
                return videoDeviceController.setMediaStreamPropertiesAsync(CapMSType.videoRecord, videoRecordResolution);
            });
    }

    /**
     * When Capture button is clicked, try to capture a picture and return
     */
    function onCameraCaptureButtonClick() {
        // Make sure user can't click more than once
        if (this.getAttribute('clicked') === '1') {
            return false;
        } else {
            this.setAttribute('clicked', '1');
        }
        captureAction();
    }

    /**
     * When Cancel button is clicked, destroy camera preview and return with error callback
     */
    function onCameraCancelButtonClick() {
        // Make sure user can't click more than once
        if (this.getAttribute('clicked') === '1') {
            return false;
        } else {
            this.setAttribute('clicked', '1');
        }
        destroyCameraPreview();
        errorCallback('no image selected');
    }

    /**
     * When the phone orientation change, get the event and change camera preview rotation
     * @param  {Object} e - SimpleOrientationSensorOrientationChangedEventArgs
     */
    function onOrientationChange(e) {
        setPreviewRotation(e.orientation);
    }

    /**
     * Converts SimpleOrientation to a VideoRotation to remove difference between camera sensor orientation
     * and video orientation
     * @param  {number} orientation - Windows.Devices.Sensors.SimpleOrientation
     * @return {number} - Windows.Media.Capture.VideoRotation
     */
    function orientationToRotation(orientation) {
        // VideoRotation enumerable and BitmapRotation enumerable have the same values
        // https://msdn.microsoft.com/en-us/library/windows/apps/windows.media.capture.videorotation.aspx
        // https://msdn.microsoft.com/en-us/library/windows/apps/windows.graphics.imaging.bitmaprotation.aspx

        switch (orientation) {
            // portrait
            case Windows.Devices.Sensors.SimpleOrientation.notRotated:
                return Windows.Media.Capture.VideoRotation.clockwise90Degrees;
            // landscape
            case Windows.Devices.Sensors.SimpleOrientation.rotated90DegreesCounterclockwise:
                return Windows.Media.Capture.VideoRotation.none;
            // portrait-flipped (not supported by WinPhone Apps)
            case Windows.Devices.Sensors.SimpleOrientation.rotated180DegreesCounterclockwise:
                // Falling back to portrait default
                return Windows.Media.Capture.VideoRotation.clockwise90Degrees;
            // landscape-flipped
            case Windows.Devices.Sensors.SimpleOrientation.rotated270DegreesCounterclockwise:
                return Windows.Media.Capture.VideoRotation.clockwise180Degrees;
            // faceup & facedown
            default:
                // Falling back to portrait default
                return Windows.Media.Capture.VideoRotation.clockwise90Degrees;
        }
    }

    /**
     * Rotates the current MediaCapture's video
     * @param {number} orientation - Windows.Devices.Sensors.SimpleOrientation
     */
    function setPreviewRotation(orientation) {
        capture.setPreviewRotation(orientationToRotation(orientation));
    }

    try {
        createCameraUI();
        startCameraPreview();
    } catch (ex) {
        errorCallback(ex);
    }
}
