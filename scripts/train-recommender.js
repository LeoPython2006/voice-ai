const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'namaz_faq.json');
const modelPath = path.join(__dirname, '..', 'data', 'namaz_model.json');

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/);
}

const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const model = dataset.map(item => ({
  ...item,
  tokens: tokenize(item.query)
}));

fs.writeFileSync(modelPath, JSON.stringify(model, null, 2));
console.log('Model saved to', modelPath);

