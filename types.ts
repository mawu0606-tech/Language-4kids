export enum TargetLanguage {
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  ITALIAN = 'Italian',
  JAPANESE = 'Japanese',
  CHINESE = 'Mandarin Chinese',
  KOREAN = 'Korean',
  RUSSIAN = 'Russian',
  HINDI = 'Hindi'
}

export interface LanguageConfig {
  id: TargetLanguage;
  flag: string;
  color: string;
  greeting: string;
}

export interface TranslationResult {
  original: string;
  translatedText: string;
  phonetic: string; // Simple pronunciation guide
  pronunciationNote: string; // Detailed guide (e.g. "Rhymes with...")
  emoji: string;
  funFact: string; // Short sentence or context for kids
}