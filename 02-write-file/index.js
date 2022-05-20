const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const consoleReadline = readline.createInterface({ input, output });
const filePath = path.join(__dirname, 'text.txt');

function inputHandler(answer) {
  // once use
  dataHandler(answer);

  // line listener
  consoleReadline.on('line', dataHandler);
}

// emit close
function exitInput () {
  consoleReadline.close();
}

function dataHandler(readline) {
  if (readline === 'exit') {
    exitInput ();
  } else {
    const writeStream =  fs.createWriteStream(filePath, {flags : 'a', encoding : 'utf-8'});
    writeStream.write(`${readline}\n`);
    writeStream.end();
    if (writeStream.destroyed) {
      writeStream.destroy();
    }
  }
}

function createNewFile() {
  const writeStream =  fs.createWriteStream(filePath, {flags : 'a', encoding : 'utf-8'});
  if (writeStream.destroyed) {
    writeStream.destroy();
  }
}

//exit listeners
consoleReadline.on('SIGINT', ()=> {console.log('Process exit. Bye.'); process.exit(); }); //ctrl + c
consoleReadline.on('close', ()=> {console.log('Process exit. Bye.'); process.exit(); }); // input: 'exit'

//create file
createNewFile();
//run input
consoleReadline.question('Enter any text:\n', inputHandler);