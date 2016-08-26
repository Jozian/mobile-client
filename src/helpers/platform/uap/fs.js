const { openIfExists, replaceExisting } = Windows.Storage.CreationCollisionOption;
const replaceFileOnCopy = Windows.Storage.NameCollisionOption.replaceExisting;

const currentFolder = Windows.Storage.ApplicationData.current.localFolder;
const removeToBin = Windows.Storage.StorageDeleteOption.default;

let activeFolder = null;

async function cwd(path) {
  if (!activeFolder) {
    throw new Error('No active folder');
  }
  let folder = await currentFolder.getFolderAsync(activeFolder);
  for (const pathItem of path) {
    folder = await folder.getFolderAsync(pathItem);
  }
  return folder;
}

export async function save({ path, content, name }) {
  if (!activeFolder) {
    throw new Error('No active folder');
  }
  let folder = await currentFolder.createFolderAsync(activeFolder, openIfExists);
  for (const pathItem of path) {
    folder = await folder.createFolderAsync(pathItem, openIfExists);
  }
  const file = await folder.createFileAsync(name, replaceExisting);
  return await Windows.Storage.FileIO.writeTextAsync(file, content);
}

export async function remove({ path, name }) {
  const folder = await cwd(path);
  const file = await folder.getFileAsync(name);
  return await file.deleteAsync(removeToBin);
}

export async function copy({ path, from, to }) {
  const folder = await cwd(path);
  const file = await folder.getFileAsync(from);
  return await file.copyAsync(folder, to, replaceFileOnCopy);
}

export async function load({ path, name }) {
  const folder = await cwd(path);
  const file = await folder.getFileAsync(name);
  return await Windows.Storage.FileIO.readTextAsync(file);
}

export function setActiveFolder(path) {
  activeFolder = path;
}
