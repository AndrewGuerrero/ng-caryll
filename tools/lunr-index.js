const fs = require('fs');
const glob = require('glob');
const matter = require('gray-matter');
const removeMd = require('remove-markdown');
const path = require('path');
const lunr = require('lunr');

const INPUT_DIR = 'content/**';
const BASE_DIR = path.dirname(INPUT_DIR);
const OUTPUT_FILE = 'src/assets/lunr/index.json';
const JSON_DOC = [];

const stream = fs.createWriteStream(OUTPUT_FILE);
readDirectory(INPUT_DIR);
writeIndex();
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
  const item = {
    'href': '/' + filePath
      .substring(0, filePath.lastIndexOf('.'))
      .replace(BASE_DIR + '/', ''),
    'title': meta.data.title,
    'tags': meta.data.tags,
    'content': removeMd(meta.content),
  };
  JSON_DOC.push(item);
}

function writeIndex() {
  const index = lunr(function () {
    this.ref('href');
    this.field('title', { boost: 10 });
    this.field('tags', { boost: 2 });
    this.field('content');

    JSON_DOC.forEach(function (doc) {
      this.add(doc);
    }, this);
  });
  stream.write(JSON.stringify(index));
}