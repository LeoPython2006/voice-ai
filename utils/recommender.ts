import fs from 'fs';
import path from 'path';

type Item = {
  query: string;
  response?: string;
  recommended_items?: unknown;
  tokens: string[];
};

let model: Item[] | null = null;

function loadModel(): Item[] {
  if (!model) {
    const file = path.join(process.cwd(), 'data', 'namaz_model.json');
    model = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return model!;
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function recommend(query: string) {
  const tokens = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/);

  let best: Item | null = null;
  let bestScore = 0;
  for (const item of loadModel()) {
    const score = jaccard(tokens, item.tokens);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}
