let loc = null;

export default function getLocation() {
  if (!loc) {
    loc = new Windows.Devices.Geolocation.Geolocator();
  }
  return loc.getGeopositionAsync().then(location => location.coordinate);
}
