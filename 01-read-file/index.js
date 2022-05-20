const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(filePath, { flags: 'r', encoding : 'utf-8' });
readStream.on('data', (data) => {
  console.log(data);
});