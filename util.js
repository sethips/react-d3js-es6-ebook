const { execSync } = require('child_process');

const fs = require('fs');
const path = require('path');

const fp = require('lodash/fp');

const prettier = require('prettier');
const retext = require('retext');
const emoji = require('retext-emoji');

const {
  prettierConfig,
  srcDirAbsPath,
  fullManuscriptAbsPath,
  fullHtmlAbsPath,
} = require('./config');

// # pure-ish functions
const emojify = fp.pipe(
  retext().use(emoji, { convert: 'encode' }).processSync,
  String
);

const gemojify = fp.pipe(
  retext().use(emoji, { convert: 'decode' }).processSync,
  String
);

const prettify = fp.curry((parser, srcFileBody) =>
  prettier.format(srcFileBody, Object.assign({}, { parser }, prettierConfig))
);

function splitIntoSectionsAndLectures(fullBody) {
  // generate a bookData object to be used by remarq.js to generate book
  // files for each tier and by teachable.js to deploy assets to be loaded by
  // the teachable-markdown snippet.
  // the schema is:
  // bookData = {
  //   sections: [
  //     {
  //       sectionTitle: '',
  //       lectures: [
  //         {
  //           lectureTitle: '',
  //         },
  //       ],
  //     },
  //   ],
  // };
  function newBook() {
    return { sections: [] };
  }
  function newSection() {
    return { sectionTitle: '', lectures: [] };
  }
  function newLecture() {
    return { lectureTitle: '', lectureBody: '' };
  }
  const bookData = newBook();
  let currentSection = newSection();
  let currentLecture = newLecture();

  let srcLineIndex = 0;
  const srcLines = fullBody.split(`\n`);
  let dstLines = [];

  while (srcLineIndex < srcLines.length) {
    const srcLine = srcLines[srcLineIndex];
    if (
      currentSection.sectionTitle &&
      currentLecture.lectureTitle &&
      !srcLine.includes('end-lecture')
    ) {
      dstLines.push(srcLine);
      srcLineIndex++;
    } else if (
      currentSection.sectionTitle &&
      currentLecture.lectureTitle &&
      srcLine.includes('end-lecture')
    ) {
      console.log(currentLecture);
      currentLecture.lectureBody = dstLines.join(`\n`);
      currentSection.lectures.push(currentLecture);
      currentLecture = newLecture();
      dstLines = [];
      srcLineIndex++;
    } else if (
      currentSection.sectionTitle &&
      !currentLecture.lectureTitle &&
      srcLine.includes('end-section')
    ) {
      bookData.sections.push(currentSection);
      currentSection = newSection();
      srcLineIndex++;
    } else if (
      currentSection.sectionTitle &&
      !currentLecture.lectureTitle &&
      srcLine.includes('begin-lecture')
    ) {
      currentLecture.lectureTitle = srcLine.match(/title="(.*)"/)[1];
      srcLineIndex++;
    } else if (
      !currentSection.sectionTitle &&
      !currentLecture.lectureTitle &&
      srcLine.includes('begin-section')
    ) {
      currentSection.sectionTitle = srcLine.match(/title="(.*)"/)[1];
      srcLineIndex++;
    } else {
      srcLineIndex++;
    }
  }
  return bookData;
}

// # effectful functions

function convertFullManuscriptToHtml() {
  const pandocToHtmlCommand = `
    pandoc
      -f markdown
      -t html
      -s ${fullManuscriptAbsPath}
      -o ${fullHtmlAbsPath} &&
    npx juice ${fullHtmlAbsPath} ${fullHtmlAbsPath}`;

  runShellCommand(pandocToHtmlCommand);
}

function conditionalLog(isLoggingEnabled, label) {
  let stackFramesInCurrentFile, indentationCount, indentation;
  if (isLoggingEnabled) {
    stackFramesInCurrentFile = new Error().stack
      .split(`\n`)
      .filter(line => line.match(__filename)).length;
    indentationCount = stackFramesInCurrentFile - 1;
    indentation = `${indentationCount}` + '>>'.repeat(indentationCount);
  }

  return function(value) {
    if (isLoggingEnabled)
      console.log(
        `\n\n\n\n${indentation}${label ? label + `:` : ''}\n\n${value}`
      );
    return value;
  };
}

function prettyJson(obj) {
  return prettify('json')(JSON.stringify(obj, null, 2));
}

function runShellCommand(
  commandString,
  errorMessage = 'Something went wrong.'
) {
  console.log(`\n\n=> Running shell command:`);
  console.log('    $ ' + commandString);
  let output;
  try {
    output = String(execSync(commandString));
  } catch (e) {
    console.log(`\n    !ERROR!: ${errorMessage}`);
    output = String(e);
  }
  console.log(`\n    output:`, output);
}

function getSrcFileAbsPaths() {
  return fs
    .readFileSync(path.resolve(srcDirAbsPath, 'Book.txt'), {
      encoding: 'utf8',
    })
    .trim()
    .split(`\n`)
    .map(fp.trim)
    .map(fp.curry(path.resolve)(srcDirAbsPath));
}

function getJoinedFileBodies(srcFileAbsPaths) {
  return srcFileAbsPaths
    .map(srcFileAbsPath =>
      fs.readFileSync(srcFileAbsPath, { encoding: 'utf8' })
    )
    .join(`\n\n`);
}

function writeFullManuscript() {
  fs.writeFileSync(
    fullManuscriptAbsPath,
    getJoinedFileBodies(getSrcFileAbsPaths())
  );
}

module.exports = {
  emojify,
  gemojify,
  prettify,
  prettyJson,
  conditionalLog,
  runShellCommand,
  writeFullManuscript,
  convertFullManuscriptToHtml,
  splitIntoSectionsAndLectures,
};
