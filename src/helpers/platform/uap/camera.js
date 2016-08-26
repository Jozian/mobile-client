import cameraPlugin from './cameraPlugin';
const CameraCapture = Windows.Media.Capture.MediaCapture;
let captureUI;
let url = '';


export function close () {
  URL.revokeObjectURL(url);
  url = '';

  captureUI.stopRecordAsync();
}
export function openPreview()  {
  cameraPlugin(() => {
    console.log('!')
  }, (err) => {
    console.log(err);
  }, []);


  /*captureUI = new CameraCapture();
  await captureUI.initializeAsync();
  url = URL.createObjectURL(captureUI);
  return url;*/
}

async function takePhonePicture() {
  const photoProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createJpeg();
  const stream = new Windows.Storage.Streams.InMemoryRandomAccessStream();

  await captureUI.capturePhotoToStreamAsync(photoProperties, stream);

  const size = stream.size;
  const inputStream = stream.getInputStreamAt(0);
  const reader = new Windows.Storage.Streams.DataReader(inputStream);
  await reader.loadAsync(size);
  const buffer = reader.readBuffer(size);
  const base64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
  return base64;
};

async function takeTabletPicture() {
  const photo = await captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo);
  const stream = await photo.openAsync(Windows.Storage.FileAccessMode.read);
  const size = stream.size;
  const inputStream = stream.getInputStreamAt(0);
  const reader = new Windows.Storage.Streams.DataReader(inputStream);
  await reader.loadAsync(size);
  const buffer = reader.readBuffer(size);
  const base64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
  return base64;
}

export async function takePicture() {
  return await takePhonePicture();
}
