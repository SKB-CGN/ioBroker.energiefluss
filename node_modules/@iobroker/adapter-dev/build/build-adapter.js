"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const build_adapter_handlers_1 = require("./build-adapter-handlers");
const reactOptions = {
    reactRootDir: {
        type: "string",
        alias: "rr",
        default: "admin",
        description: "Directory where the React part of the adapter is located",
    },
    reactOutDir: {
        type: "string",
        alias: "ro",
        default: "build",
        description: "Directory where the compiled React output will be placed, relative to reactRootDir",
    },
    reactWatchDir: {
        type: "string",
        alias: "rw",
        default: ".watch",
        description: "Directory where the compiled React output will be placed in watch mode, relative to reactRootDir",
    },
    reactPattern: {
        type: "string",
        alias: "rp",
        default: "src/{index,tab}.{tsx,jsx}",
        description: "Glob pattern for React source files, relative to reactRootDir. Each match will result in a separate bundle.",
    },
    reactTsConfig: {
        type: "string",
        alias: "rtsc",
        default: "tsconfig.json",
        description: "Path to the React tsconfig.json file, relative to reactRootDir",
    },
    reactBundle: {
        type: "boolean",
        alias: "rb",
        default: true,
        description: "Bundle compiled React output into one file per entry point.",
    },
    reactFormat: {
        alias: "rf",
        choices: ["iife", "esm"],
        description: "Format of the output file(s). ESM should only be selected when targeting modern browsers exclusively.",
    },
    reactCompileTarget: {
        type: "string",
        alias: "rt",
        default: "es2018",
        description: "Compilation target for React. Determines which JS features will be used in the output file.",
    },
};
const tsOptions = {
    typescriptRootDir: {
        type: "string",
        alias: "tsr",
        default: ".",
        description: "Directory where the TypeScript part of the adapter is located",
    },
    typescriptOutDir: {
        type: "string",
        alias: "tso",
        default: "build",
        description: "Directory where the compiled TypeScript output will be placed, relative to typescriptRootDir",
    },
    typescriptPattern: {
        type: "string",
        alias: "tsp",
        default: "src/**/*.ts",
        description: "Glob pattern for TypeScript source files, relative to typescriptRootDir. Should not be changed unless bundling is enabled. Each match will result in a separate bundle.",
    },
    typescriptTsConfig: {
        type: "string",
        alias: "tsc",
        default: "tsconfig.build.json",
        description: "Path to the tsconfig.json file used for building TypeScript, relative to typescriptRootDir",
    },
    typescriptBundle: {
        type: "boolean",
        alias: "tsb",
        default: false,
        description: "Bundle compiled TypeScript output into one file per entry point.",
    },
    typescriptFormat: {
        alias: "tsf",
        choices: ["cjs"],
        description: "Format of the output file(s). Only CommonJS (cjs) is supported at the moment.",
    },
    typescriptCompileTarget: {
        type: "string",
        alias: "tst",
        default: "node12",
        description: "Compilation target for TypeScript. Determines which JS features will be used in the output file. Should be in sync with the minimum Node.js version supported by the adapter/ioBroker.",
    },
};
const parser = (0, yargs_1.default)(process.argv.slice(2));
parser
    .env("IOBROKER_BUILD")
    .strict()
    .usage("ioBroker adapter build script\n\nUsage: $0 <command> [options]")
    .alias("h", "help")
    .alias("v", "version")
    .options({
    watch: {
        type: "boolean",
        alias: "w",
        default: false,
        description: "Watch for changes and recompile",
    },
    config: {
        alias: "c",
        describe: "Path to the build config file",
        config: true,
        default: ".buildconfig.json",
    },
})
    .command(["react"], "Compile React sources", (yargs) => yargs.options(reactOptions), async (argv) => {
    const reactOptions = {
        pattern: argv.reactPattern,
        tsConfig: argv.reactTsConfig,
        bundle: argv.reactBundle,
        format: argv.reactFormat,
        compileTarget: argv.reactCompileTarget,
        rootDir: argv.reactRootDir,
        outDir: argv.reactOutDir,
        watchDir: argv.reactWatchDir,
    };
    await (0, build_adapter_handlers_1.handleBuildReactCommand)(argv.watch, reactOptions);
})
    .command(["typescript", "ts"], "Compile TypeScript sources", (yargs) => yargs.options(tsOptions), async (argv) => {
    const typescriptOptions = {
        pattern: argv.typescriptPattern,
        tsConfig: argv.typescriptTsConfig,
        bundle: argv.typescriptBundle,
        format: argv.typescriptFormat,
        compileTarget: argv.typescriptCompileTarget,
        rootDir: argv.typescriptRootDir,
        outDir: argv.typescriptOutDir,
    };
    await (0, build_adapter_handlers_1.handleBuildTypeScriptCommand)(argv.watch, typescriptOptions);
})
    .command(["all"], "Compile all of the above", (yargs) => yargs.options({
    ...reactOptions,
    ...tsOptions,
}), async (argv) => {
    const reactOptions = {
        pattern: argv.reactPattern,
        tsConfig: argv.reactTsConfig,
        bundle: argv.reactBundle,
        format: argv.reactFormat,
        compileTarget: argv.reactCompileTarget,
        rootDir: argv.reactRootDir,
        outDir: argv.reactOutDir,
        watchDir: argv.reactWatchDir,
    };
    const typescriptOptions = {
        pattern: argv.typescriptPattern,
        tsConfig: argv.typescriptTsConfig,
        bundle: argv.typescriptBundle,
        format: argv.typescriptFormat,
        compileTarget: argv.typescriptCompileTarget,
        rootDir: argv.typescriptRootDir,
        outDir: argv.typescriptOutDir,
    };
    await (0, build_adapter_handlers_1.handleBuildAllCommand)(argv.watch, reactOptions, typescriptOptions);
})
    .wrap(Math.min(100, parser.terminalWidth()))
    .demandCommand(1)
    .help().argv;
//# sourceMappingURL=build-adapter.js.map