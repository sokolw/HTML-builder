const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

const target = 'styles';
const dist = 'project-dist';
const targetFolder = path.join(__dirname, target);
const distFolder = path.join(__dirname, dist);
const nameBundleFile = 'bundle.css';

async function collectStyles () {
  let files = null;

  try {
    await fsPromises.access(targetFolder, fs.constants.R_OK);
    files = await fsPromises.readdir(targetFolder, {withFileTypes:true});
  } catch {
    console.log(`Folder ${target} no exist!`);
    return;
  }

  const writeStream =  fs.createWriteStream(path.join(distFolder, nameBundleFile), {flags : 'w', encoding : 'utf-8'});
  files.forEach(file => {
    if (file.isFile() && path.extname(file.name).includes('.css')) {
      const readStream = fs.createReadStream(path.join(targetFolder, file.name), { flags: 'r', encoding : 'utf-8' });
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

collectStyles ();