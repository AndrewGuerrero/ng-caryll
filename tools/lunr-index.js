const fs = require('fs');
const glob = require('glob');
const matter = require('gray-matter');
const removeMd = require('remove-markdown');
const path = require('path');

const INPUT_DIR = 'content/**';
const BASE_DIR = path.dirname(INPUT_DIR);
const OUTPUT_FILE = 'src/assets/lunr/index.json';
const JSON_LIST = [];

const stream = fs.createWriteStream(OUTPUT_FILE);
readDirectory(INPUT_DIR);
stream.write(JSON.stringify(JSON_LIST, null, 4));
stream.end();

function readDirectory(path) {
  const files = glob.sync(path);
  const length = files.length;
  for (var i = 0; i < length; i++) {
    const stats = fs.lstatSync(files[i]);
    if (!stats.isDirectory()) {
      readFile(files[i]);
    }
  }
  return true;
}

function readFile(filePath) {
  const ext = path.extname(filePath);
  const meta = matter.read(filePath);
  var plainText = '';
  if (ext == '.md') {
    plainText = removeMd(meta.content);
  }
  var uri = '/' + filePath
    .substring(0, filePath.lastIndexOf('.'))
    .replace(BASE_DIR + '/', '');
  if (meta.data.url != undefined) {
    uri = meta.data.urla;
  }
  var tags = [];
  if (meta.data.tags) {
    tags = meta.data.tags;
  }
  const item = {
    'uri': uri,
    'title': meta.data.title,
    'content': plainText,
    'tags': tags
  };
  JSON_LIST.push(item);
}