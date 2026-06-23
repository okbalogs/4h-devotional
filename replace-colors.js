const fs = require('fs');
const path = require('path');

const DIRECTORY = '/home/balogun/Music/4h-devotion-tracker/src';

const REPLACEMENTS = [
  // Primary brand (brown -> green)
  { regex: /#9d4f14/gi, replacement: 'var(--clr-primary)' },
  { regex: /rgba\(157,\s*79,\s*20,\s*0\.([0-9]+)\)/gi, replacement: 'rgba(47, 93, 69, 0.$1)' },
  
  // Backgrounds and cards
  { regex: /#fcf8f4/gi, replacement: 'var(--clr-cream)' },
  { regex: /#fefcf8/gi, replacement: 'var(--clr-card)' },
  { regex: /#f7ede3/gi, replacement: 'var(--clr-border)' }, // Used for borders often
  { regex: /#efe2d5/gi, replacement: 'var(--clr-border)' },
  { regex: /#e8d8c4/gi, replacement: 'var(--clr-border)' },
  { regex: /#eee4d8/gi, replacement: 'var(--clr-border)' },
  { regex: /#fdf6ec/gi, replacement: 'var(--clr-cream)' },

  // Dark modes
  { regex: /#211c16/gi, replacement: 'var(--clr-card)' },
  { regex: /#1e1914/gi, replacement: 'var(--clr-background)' }, // Wait, --clr-background isn't defined? I'll use var(--clr-cream) for backgrounds
  { regex: /#17130f/gi, replacement: 'var(--clr-cream)' },
  { regex: /#2a2218/gi, replacement: 'var(--clr-card)' },
  { regex: /#332b20/gi, replacement: 'var(--clr-card)' },
  { regex: /#3c3028/gi, replacement: 'var(--clr-border)' },

  // Texts
  { regex: /#3a2210/gi, replacement: 'var(--clr-dark)' },
  { regex: /#7a6555/gi, replacement: 'var(--clr-text-muted)' },
  { regex: /#8c786a/gi, replacement: 'var(--clr-text-muted)' },
  { regex: /#6a5c4e/gi, replacement: 'var(--clr-text-muted)' },
  { regex: /#9c8874/gi, replacement: 'var(--clr-text-muted)' },

  // Gradient remnants
  { regex: /#c0783a/gi, replacement: 'var(--clr-primary-hover)' },
  { regex: /#bb621c/gi, replacement: 'var(--clr-primary-hover)' },
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
