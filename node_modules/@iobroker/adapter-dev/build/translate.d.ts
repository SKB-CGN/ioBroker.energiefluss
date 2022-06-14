/**
 * Translates text using the Google Translate API.
 * @param text The text to translate
 * @param targetLang The target language code
 * @returns The translated text or the same text if translation failed.
 */
export declare function translateText(text: string, targetLang: string): Promise<string>;
