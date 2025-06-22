import { franc } from 'franc-min';
import { loadModule, LanguageIdentifier } from 'cld3-asm';

let detectorPromise: Promise<LanguageIdentifier> | null = null;

async function getDetector(): Promise<LanguageIdentifier> {
  if (!detectorPromise) {
    detectorPromise = loadModule().then((factory) => factory.create(0, 100));
  }
  return detectorPromise;
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const detector = await getDetector();
    const result = detector.findLanguage(text);
    if (result.language && result.language !== 'und') {
      if (result.language === 'ru') return 'rus';
      if (result.language === 'en') return 'eng';
      return result.language;
    }
  } catch {
    // ignore errors and fall back to franc
  }
  const code = franc(text);
  return code === 'und' ? 'eng' : code;
}
