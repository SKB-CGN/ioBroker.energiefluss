"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = void 0;
const translate_1 = require("@google-cloud/translate");
const axios_1 = __importDefault(require("axios"));
const fs_extra_1 = require("fs-extra");
const network_1 = require("./network");
const util_1 = require("./util");
const translationCache = new Map();
/**
 * Translates text using the Google Translate API.
 * @param text The text to translate
 * @param targetLang The target language code
 * @returns The translated text or the same text if translation failed.
 */
async function translateText(text, targetLang) {
    if (targetLang === "en")
        return text;
    // Try to read the translation from the translation cache
    if (!translationCache.has(targetLang))
        translationCache.set(targetLang, new Map());
    const langCache = translationCache.get(targetLang);
    // or fall back to an online translation
    if (!langCache.has(text)) {
        const translator = await getTranslator();
        let translated;
        try {
            translated = await translator.translate(text, targetLang);
        }
        catch (e) {
            (0, util_1.error)(`Could not translate to "${targetLang}": ${e}`);
            return text;
        }
        langCache.set(text, translated);
    }
    return langCache.get(text);
}
exports.translateText = translateText;
async function createTranslator() {
    if (!!process.env.TESTING) {
        console.log("Using dummy testing translation");
        return new TestingTranslator();
    }
    if (!!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const v3 = new GoogleV3Translator();
        try {
            await v3.init();
            console.log("Using Google Translate V3");
            return v3;
        }
        catch (err) {
            (0, util_1.error)(err);
        }
    }
    console.log("Using Legacy Google Translate");
    return new LegacyTranslator();
}
let creator = undefined;
function getTranslator() {
    if (!creator) {
        creator = createTranslator();
    }
    return creator;
}
/**
 * @see Translator implementation that is used for testing.
 * It returns a mock text.
 */
class TestingTranslator {
    async translate(text, targetLang) {
        return `Mock translation of '${text}' to '${targetLang}'`;
    }
}
/**
 * @see Translator implementation that uses the Google Translation API.
 * This API requires credentials which must be stored in a file pointed to
 * by the environment variable GOOGLE_APPLICATION_CREDENTIALS.
 */
class GoogleV3Translator {
    async init() {
        this.credentials = await (0, fs_extra_1.readJson)(process.env.GOOGLE_APPLICATION_CREDENTIALS || "");
        this.translationClient = new translate_1.TranslationServiceClient();
    }
    async translate(text, targetLang) {
        var _a;
        const request = {
            parent: `projects/${this.credentials.project_id}/locations/global`,
            contents: [text],
            mimeType: "text/plain",
            sourceLanguageCode: "en",
            targetLanguageCode: targetLang,
        };
        const [response] = await this.translationClient.translateText(request);
        if (response.translations && ((_a = response.translations[0]) === null || _a === void 0 ? void 0 : _a.translatedText)) {
            return response.translations[0].translatedText;
        }
        throw new Error(`Google couldn't translate "${text}"`);
    }
}
/**
 * @see Translator implementation that uses the old Google Translation API.
 * This API is rate limited and the user will see an error if too many
 * translation requests are done within a given timespan.
 */
class LegacyTranslator {
    async translate(text, targetLang) {
        var _a;
        try {
            const url = `http://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}&ie=UTF-8&oe=UTF-8`;
            let options = {
                url,
                timeout: (0, network_1.getRequestTimeout)(),
            };
            // If an https-proxy is defined as an env variable, use it
            options = (0, network_1.applyHttpsProxy)(options);
            const response = await (0, axios_1.default)(options);
            if (Array.isArray(response.data)) {
                // we got a valid response
                return response.data[0][0][0];
            }
        }
        catch (e) {
            if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 429) {
                throw new Error(`Could not translate to "${targetLang}": Rate-limited by Google Translate`);
            }
            else {
                throw e;
            }
        }
        throw new Error(`Invalid response for translate request`);
    }
}
//# sourceMappingURL=translate.js.map