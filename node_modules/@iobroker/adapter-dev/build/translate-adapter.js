"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const translate_adapter_handlers_1 = require("./translate-adapter-handlers");
const util_1 = require("./util");
const yargs = require("yargs/yargs");
const parser = yargs(process.argv.slice(2));
parser
    .env("IOBROKER_TRANSLATE")
    .strict()
    .usage("ioBroker adapter translator\n\nUsage: $0 <command> [options]")
    .alias("h", "help")
    .alias("v", "version")
    .command(["translate", "t", "$0"], "Translate io-package.json and all admin language files", {}, (0, util_1.interceptErrors)(translate_adapter_handlers_1.handleTranslateCommand))
    .command(["to-json", "adminWords2languages", "j"], "Convert words.js to i18n JSON files", {}, (0, util_1.interceptErrors)(translate_adapter_handlers_1.handleToJsonCommand))
    .command(["to-words", "adminLanguages2words", "w"], "Generate words.js from i18n JSON files", {}, (0, util_1.interceptErrors)(translate_adapter_handlers_1.handleToWordsCommand))
    .command(["all", "translateAndUpdateWordsJS", "a"], "Sequence of translate, to-words, to-json", {}, (0, util_1.interceptErrors)(translate_adapter_handlers_1.handleAllCommand))
    /*
    translateAndUpdateWordsJS: TaskFunction;*/
    .options({
    "io-package": {
        type: "string",
        alias: "p",
        default: "./io-package.json",
        description: "Path to the io-package.json file",
    },
    admin: {
        type: "string",
        alias: "a",
        default: "./admin",
        description: "Path to the admin directory",
    },
    words: {
        type: "string",
        alias: "w",
        description: "Path to the words.js file",
    },
    base: {
        type: "string",
        alias: "b",
        array: true,
        description: "Path to the english i18n file, multiple files are possible",
    },
    languages: {
        type: "string",
        alias: "l",
        array: true,
        description: "Specify a subset of languages to be translated",
        choices: translate_adapter_handlers_1.allLanguages,
    },
})
    .middleware(translate_adapter_handlers_1.parseOptions)
    .wrap(Math.min(100, parser.terminalWidth()))
    .help().argv;
//# sourceMappingURL=translate-adapter.js.map