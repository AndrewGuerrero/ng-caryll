const fs = require('fs');
const glob = require('glob');
const path = require('path');
const lunr = require('lunr');
const sanitize = require('sanitize-html');

const INPUT_DIR = 'src/assets/documents/**';
const BASE_DIR = path.dirname(INPUT_DIR);
const OUTPUT_FILE = 'src/assets/lunr/index.json';

const JSON_DOC = [];
const JSON_STORE = {};

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
  const doc = fs.readFileSync(filePath).toString();
  const href = '/' + filePath
    .substring(0, filePath.lastIndexOf('.'))
    .replace(BASE_DIR + '/', '');

  const docTitle = doc.match(/<h1.*>(.*)<\/h1>/)[1];
  const chapters = readChapters(doc);
  chapters.forEach(chapter => {
    const item = {
      'href': `${href}#${chapter[0]}`,
      'title': `${docTitle}: ${chapter[1]}`,
      'content': sanitize(chapter[2], { allowedTags: [] }),
    };
    JSON_DOC.push(item);
  });
}

function readChapters(doc) {
  let chapters = doc.split(/<h(?:2|3).*id="([\w-]+)".*\/span>(.*)<\/h(?:2|3)>/);
  chapters = chapters.slice(chapters.length % 3, chapters.length);
  chapters = chapters.reduce((result, value, index, array) => {
    if (index % 3 === 0) {
      result.push(array.slice(index, index + 3));
    }
    return result;
  }, []);

  return chapters;
}

function writeIndex() {
  const index = lunr(function () {
    this.ref('href');
    this.field('title', { boost: 10 });
    this.field('content');

    JSON_DOC.forEach(function (doc) {
      this.add(doc);
      JSON_STORE[doc.href] = { title: doc.title };
    }, this);
  });
  stream.write(JSON.stringify({
    index: index.toJSON(),
    store: JSON_STORE,
  }));
}