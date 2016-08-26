const crypto = Windows.Security.Cryptography;
const cbuffer = crypto.CryptographicBuffer;
const encoding = crypto.BinaryStringEncoding.utf16BE;
const Cryptography = Windows.Security.Cryptography;
const Provider = new Cryptography.DataProtection.DataProtectionProvider('LOCAL=user');

async function decrypt(key) {
  const value = cbuffer.decodeFromHexString(key);
  const data = await Provider.unprotectAsync(value);
  return cbuffer.convertBinaryToString(encoding, data);
}

async function encrypt(value) {
  const data = await Provider.protectAsync(cbuffer.convertStringToBinary(value, encoding));
  return cbuffer.encodeToHexString(data);
}

const localSettings = Windows.Storage.ApplicationData.current.localSettings.values;

export async function save(credentials) {
  localSettings.credentials = await encrypt(JSON.stringify(credentials));
}

export async function load() {
  if (!localSettings.credentials) {
    return null;
  }

  try {
    return JSON.parse(await decrypt(localSettings.credentials));
  } catch (e) {
    console.error(e);
    return null;
  }
}
