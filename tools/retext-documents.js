const fs = require('fs');
const glob = require('glob');
const report = require('vfile-reporter');
const unified = require('unified');
const parse = require('remark-parse');
const stringify = require('remark-stringify');
const remark2retext = require('remark-retext');
const english = require('retext-english');
const passive = require('retext-passive');
const simplify = require('retext-simplify');
const indefiniteArticle = require('retext-indefinite-article')

const INPUT_DIR = 'content/*.md';

remarkDirectory(INPUT_DIR);

function remarkDirectory(path) {
  const files = glob.sync(path);
  const length = files.length;
  for (var i = 0; i < length; i++) {
    const stats = fs.lstatSync(files[i]);
    if (!stats.isDirectory()) {
      retextFile(files[i]);
    }
  }
  return true;
}

function retextFile(filePath) {
  const doc = fs.readFileSync(filePath).toString();
  unified()
    .use(parse)
    .use(remark2retext, unified()
      .use(english)
      .use(passive)
      .use(indefiniteArticle)
      .use(simplify, {
        ignore: [
          'function',
          'component',
          'capability',
          'request',
          'requirement'
        ]
      }))
    .use(stringify)
    .process(doc, function (err, file) {
      if (err) throw err;
      console.log(filePath);
      console.log(report(file));
    });
}