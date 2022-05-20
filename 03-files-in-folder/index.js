const path = require('path');
const fsPromises = require('fs/promises');
const fs = require('fs');

const folderPath = path.join(__dirname, 'secret-folder');
const DIVIDER = 1024;

async function getFiles() {
  const files = await fsPromises.readdir(folderPath, {withFileTypes:true});
  files.forEach(file => {
    if (file.isFile()){
      const fileName = path.parse(file.name).name;
      const extName = path.extname(file.name).slice(1);
      let size;
      fs.stat(path.join(folderPath, file.name), (err, stats) => {
        if (err) {
          console.log(err);
        } else {
          size = stats.size / DIVIDER; // bytes to kb
          console.log(`${fileName} - ${extName} - ${size.toFixed(3)}kb`);
        }
      });
    }
  });
}
getFiles();