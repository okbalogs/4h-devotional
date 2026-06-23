const fs = require('fs');
const path = require('path');

const DIRECTORY = '/home/balogun/Music/4h-devotion-tracker/src';

const REPLACEMENTS = [
  { regex: /rgba\(224,\s*124,\s*48,\s*0\.([0-9]+)\)/gi, replacement: 'rgba(47, 93, 69, 0.$1)' },
  { regex: /rgba\(157,\s*79,\s*20,\s*0\.([0-9]+)\)/gi, replacement: 'rgba(47, 93, 69, 0.$1)' },
  { regex: /rgba\(33,\s*28,\s*22,\s*0\.([0-9]+)\)/gi, replacement: 'rgba(27, 29, 27, 0.$1)' },
  { regex: /rgba\(23,\s*19,\s*15,\s*0\.([0-9]+)\)/gi, replacement: 'rgba(27, 29, 27, 0.$1)' }
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(DIRECTORY);
let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  REPLACEMENTS.forEach(({ regex, replacement }) => {
    newContent = newContent.replace(regex, replacement);
  });

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    totalReplaced++;
    console.log(`Replaced in ${file}`);
  }
});

console.log(`Done! Modified ${totalReplaced} files.`);
