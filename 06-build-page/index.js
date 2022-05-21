const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

const target = '/';
const dist = 'project-dist';
const template = 'template.html';
const indexHTML = 'index.html';
const componentsFolder = 'components';
const targetFolder = path.join(__dirname, target);
const distFolder = path.join(__dirname, dist);
const nameBundleFile = 'style.css';
const stylesFolder = 'styles';
const assetsFolder = 'assets';

async function buildHtmlFile () {
  let files = null;
  try {
    await fsPromises.access(path.join(targetFolder, template), fs.constants.R_OK);

    try {
      files = await fsPromises.readdir(path.join(targetFolder, componentsFolder), {withFileTypes:true});
    } catch {
      console.log(`Folder ${componentsFolder} no exist!`);
    }

    let readFile = await fsPromises.readFile(path.join(targetFolder, template), { flags: 'r', encoding : 'utf-8'});
    const placeholders = readFile.match(/{{.+}}/gi);

    if (files !== null){
      files = files.map(file => path.parse(file.name).name);
      for (const placeholder of placeholders) {
        if (files.includes(placeholder.replace(/[{{}}]/gi, ''))) {
          const readPlaceholderFile = await fsPromises.readFile(path.join(targetFolder, componentsFolder, `${placeholder.replace(/[{{}}]/gi, '')}.html`), { flags: 'r', encoding : 'utf-8'});
          readFile = readFile.replace(placeholder, readPlaceholderFile);
        }
      }
      await fsPromises.mkdir(distFolder, {recursive:true});
      await fsPromises.writeFile(path.join(distFolder, indexHTML), readFile, { flags: 'w', encoding : 'utf-8'});
    }
  } catch {
    console.log(`File ${template} no exist!`);
    return;
  }
}

async function collectStyles () {
  let files = null;

  try {
    await fsPromises.access(path.join(targetFolder, stylesFolder) , fs.constants.R_OK);
    files = await fsPromises.readdir(path.join(targetFolder, stylesFolder), {withFileTypes:true});
  } catch {
    console.log(`Folder ${stylesFolder} no exist!`);
    return;
  }

  const writeStream =  fs.createWriteStream(path.join(distFolder, nameBundleFile), {flags : 'w', encoding : 'utf-8'});
  files.forEach(file => {
    if (file.isFile() && path.extname(file.name).includes('.css')) {
      const readStream = fs.createReadStream(path.join(targetFolder, stylesFolder, file.name), { flags: 'r', encoding : 'utf-8' });
      readStream.on('data', (data) => {
        if (writeStream.writable) {
          writeStream.write(data);
        }
      });
    }
  });

  if (writeStream.destroyed) {
    writeStream.destroy();
  }
}

async function copyDir(innerTargetFolder = null, innerDistFolder = null) {
  const files = await fsPromises.readdir(isRecursive(innerTargetFolder) ?? path.join(targetFolder, assetsFolder), {withFileTypes:true});
  let distFiles = null;
  try {
    await fsPromises.access(isRecursive(innerDistFolder) ?? path.join(distFolder, assetsFolder), fs.constants.R_OK);
    distFiles = await fsPromises.readdir(isRecursive(innerDistFolder) ?? path.join(distFolder, assetsFolder));
  } catch {
    await fsPromises.mkdir(isRecursive(innerDistFolder) ?? path.join(distFolder, assetsFolder), {recursive:true});
  }
  files.forEach((file) => {
    if(file.isFile()){
      if (distFiles !== null){
        if (!distFiles.includes(file.name)) {
          fsPromises.copyFile(path.join(isRecursive(innerTargetFolder) ?? path.join(targetFolder, assetsFolder), file.name), path.join(isRecursive(innerDistFolder) ?? path.join(distFolder, assetsFolder), file.name));
        }
      } else {
        fsPromises.copyFile(path.join(isRecursive(innerTargetFolder) ?? path.join(targetFolder, assetsFolder), file.name), path.join(isRecursive(innerDistFolder) ?? path.join(distFolder, assetsFolder), file.name));
      }
    } else if (file.isDirectory()){
      copyDir(path.join(isRecursive(innerTargetFolder) ?? path.join(targetFolder, assetsFolder), file.name), path.join(isRecursive(innerDistFolder) ?? path.join(distFolder, assetsFolder), file.name));
    }
  });
}

function isRecursive (folder) {
  if (folder !== null) {
    return folder;
  }
}

async function assembleProject () {
  await buildHtmlFile();
  await collectStyles ();
  await copyDir();
}

assembleProject ();