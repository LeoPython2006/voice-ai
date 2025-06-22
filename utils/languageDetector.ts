import { franc } from 'franc-min';

export function detectLanguage(text: string): string {
  const code = franc(text);
  return code === 'und' ? 'en' : code;
}
