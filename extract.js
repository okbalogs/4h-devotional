const fs = require('fs');

const html = fs.readFileSync('ESM Quiet Time Wireframes.html', 'utf-8');
const match = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
if (match) {
  const template = JSON.parse(match[1]);
  fs.writeFileSync('extracted_template.html', template);
  console.log('Extracted template HTML');
} else {
  console.log('No template found');
}
