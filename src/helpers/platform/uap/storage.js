const localSettings = Windows.Storage.ApplicationData.current.localSettings.values;

export function save(key, data) {
  localSettings[key] = JSON.stringify(data);
}

export function load(key) {
  if (!localSettings[key]) {
    return null;
  }

  return JSON.parse(localSettings[key]);
}
