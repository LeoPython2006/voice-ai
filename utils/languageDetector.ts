import { franc } from 'franc-min';

/**
 * Detect language of a text.
 * Returns ISO 639-3 codes such as:
 *   - "eng" for English
 *   - "rus" for Russian
 * Falls back to "eng" when nothing matches.
 */
export function detectLanguage(text: string): string {
  const code = franc(text);

  // If franc-min is sure, use its answer.
  if (code !== 'und') return code;

  // franc-min’s model list is small and sometimes
  // misses Russian. Quick Cyrillic heuristic:
  const cyrillic = /[А-Яа-яЁё]/;
  if (cyrillic.test(text)) return 'rus';

  // Default fallback
  return 'eng';
}
