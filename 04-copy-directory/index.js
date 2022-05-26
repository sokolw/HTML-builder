const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

const target = 'files';
const dist = 'files-copy';
const targetFolder = path.join(__dirname, target);
const distFolder = path.join(__dirname, dist);

async function copyDir(innerTargetFolder = null, innerDistFolder = null) {
  const files = await fsPromises.readdir(isRecursive(innerTargetFolder) ?? targetFolder, {withFileTypes:true});
  let distFiles = null;
  try {
    await fsPromises.access(isRecursive(innerDistFolder) ?? distFolder, fs.constants.R_OK);
    distFiles = await fsPromises.readdir(isRecursive(innerDistFolder) ?? distFolder);
  } catch {
    await fsPromises.mkdir(isRecursive(innerDistFolder) ?? distFolder, {recursive:true});
  }
  files.forEach((file) => {
    if(file.isFile()){
      if (distFiles !== null){
        if (!distFiles.includes(file.name)) {
          fsPromises.copyFile(path.join(isRecursive(innerTargetFolder) ?? targetFolder, file.name), path.join(isRecursive(innerDistFolder) ?? distFolder, file.name));
          distFiles.splice(distFiles.indexOf(file.name), 1);
        } else {
          distFiles.splice(distFiles.indexOf(file.name), 1);
        }
      } else {
        fsPromises.copyFile(path.join(isRecursive(innerTargetFolder) ?? targetFolder, file.name), path.join(isRecursive(innerDistFolder) ?? distFolder, file.name));
      }
    } else if (file.isDirectory()){
      if (distFiles !== null) {
        distFiles.splice(distFiles.indexOf(file.name), 1);
      }
      copyDir(path.join(isRecursive(innerTargetFolder) ?? targetFolder, file.name), path.join(isRecursive(innerDistFolder) ?? distFolder, file.name));
    }
  });
  // fix inject
  if (distFiles !== null) {
    let distFilesWithTypes = null;
    try {
      await fsPromises.access(isRecursive(innerDistFolder) ?? distFolder, fs.constants.R_OK);
      distFilesWithTypes = await fsPromises.readdir(isRecursive(innerDistFolder) ?? distFolder, {withFileTypes:true});
    } catch {
      await fsPromises.mkdir(isRecursive(innerDistFolder) ?? distFolder, {recursive:true});
    }
    distFilesWithTypes.forEach((file) => {
      if (distFiles.includes(file.name)){
        if(file.isFile()) {
          fs.unlink(path.join(isRecursive(innerDistFolder) ?? distFolder, file.name), (err) => {err;});
        } else {
          fs.rm(path.join(isRecursive(innerDistFolder) ?? distFolder, file.name), {recursive:true}, (err) => {err;});
        }
      }
    });
  }
}

function isRecursive (folder) {
  if (folder !== null) {
    return folder;
  }
}

copyDir();