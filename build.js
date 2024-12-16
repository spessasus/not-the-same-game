const fs = require('fs');

const OUTPUT_NAME = "Not The Same Game.html";

// Read the files
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('minified/style.min.css', 'utf8');
const js = fs.readFileSync('minified/main.min.js', 'utf8');

// Replace <link> and <script> tags with inlined content
const inlinedHtml = html
    .replace('<link href=\'src/css/style.css\' rel=\'stylesheet\'>', `<style>${css}</style>`)
    .replace('<script src=\'src/js/main.js\' type=\'module\'></script>', `<script>${js}</script>`);

// Write the result to a new file
fs.writeFileSync(OUTPUT_NAME, inlinedHtml, 'utf8');
console.log(`Compiled HTML created: ${OUTPUT_NAME}`);
