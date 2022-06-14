"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdapterDependencies = exports.getAdapterFullName = exports.getAdapterName = exports.getAppName = exports.loadInstanceObjects = exports.loadAdapterCommon = exports.loadAdapterConfig = exports.locateAdapterMainFile = exports.getAdapterExecutionMode = exports.loadIoPackage = exports.loadNpmPackage = void 0;
// Add debug logging for tests
const typeguards_1 = require("alcalzone-shared/typeguards");
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = require("fs-extra");
const path = __importStar(require("path"));
const debug = (0, debug_1.default)("testing:unit:adapterTools");
/**
 * Loads an adapter's package.json
 * @param adapterDir The directory the adapter resides in
 */
function loadNpmPackage(adapterDir) {
    return require(path.join(adapterDir, "package.json"));
}
exports.loadNpmPackage = loadNpmPackage;
/**
 * Loads an adapter's io-package.json
 * @param adapterDir The directory the adapter resides in
 */
function loadIoPackage(adapterDir) {
    return require(path.join(adapterDir, "io-package.json"));
}
exports.loadIoPackage = loadIoPackage;
function getAdapterExecutionMode(adapterDir) {
    const ioPackage = loadIoPackage(adapterDir);
    return ioPackage.common.mode;
}
exports.getAdapterExecutionMode = getAdapterExecutionMode;
/**
 * Locates an adapter's main file
 * @param adapterDir The directory the adapter resides in
 */
async function locateAdapterMainFile(adapterDir) {
    debug(`locating adapter main file in ${adapterDir}...`);
    const ioPackage = loadIoPackage(adapterDir);
    const npmPackage = loadNpmPackage(adapterDir);
    // First look for the file defined in io-package.json or package.json or use "main.js" as a fallback
    const mainFile = typeof ioPackage.common.main === "string"
        ? ioPackage.common.main
        : typeof npmPackage.main === "string"
            ? npmPackage.main
            : "main.js";
    let ret = path.join(adapterDir, mainFile);
    debug(`  => trying ${ret}`);
    if (await (0, fs_extra_1.pathExists)(ret)) {
        debug(`  => found ${mainFile}`);
        return ret;
    }
    // If both don't exist, JS-Controller uses <adapter name>.js as another fallback
    ret = path.join(adapterDir, ioPackage.common.name + ".js");
    debug(`  => trying ${ret}`);
    if (await (0, fs_extra_1.pathExists)(ret)) {
        debug(`  => found ${mainFile}`);
        return ret;
    }
    throw new Error(`The adapter main file was not found in ${adapterDir}`);
}
exports.locateAdapterMainFile = locateAdapterMainFile;
/**
 * Locates an adapter's config to populate the `adapter.config` object with
 * @param adapterDir The directory the adapter resides in
 */
function loadAdapterConfig(adapterDir) {
    const ioPackage = loadIoPackage(adapterDir);
    return ioPackage.native || {};
}
exports.loadAdapterConfig = loadAdapterConfig;
/**
 * Loads the adapter's common configuration from `io-package.json`
 * @param adapterDir The directory the adapter resides in
 */
function loadAdapterCommon(adapterDir) {
    const ioPackage = loadIoPackage(adapterDir);
    return ioPackage.common || {};
}
exports.loadAdapterCommon = loadAdapterCommon;
/**
 * Loads the instanceObjects for an adapter from its `io-package.json`
 * @param adapterDir The directory the adapter resides in
 */
function loadInstanceObjects(adapterDir) {
    const ioPackage = loadIoPackage(adapterDir);
    return ioPackage.instanceObjects || [];
}
exports.loadInstanceObjects = loadInstanceObjects;
/** Returns the branded name of "iobroker" */
function getAppName(adapterDir) {
    const npmPackage = loadNpmPackage(adapterDir);
    return npmPackage.name.split(".")[0] || "iobroker";
}
exports.getAppName = getAppName;
/** Returns the name of an adapter without the prefix */
function getAdapterName(adapterDir) {
    const ioPackage = loadIoPackage(adapterDir);
    return ioPackage.common.name;
}
exports.getAdapterName = getAdapterName;
/** Returns the full name of an adapter, including the prefix */
function getAdapterFullName(adapterDir) {
    const npmPackage = loadNpmPackage(adapterDir);
    return npmPackage.name;
}
exports.getAdapterFullName = getAdapterFullName;
/** Reads other ioBroker modules this adapter depends on from io-package.json */
function getAdapterDependencies(adapterDir) {
    const ioPackage = loadIoPackage(adapterDir);
    const ret = {};
    if ((0, typeguards_1.isArray)(ioPackage.common.dependencies)) {
        for (const dep of ioPackage.common.dependencies) {
            if (typeof dep === "string") {
                ret[dep] = "latest";
            }
            else if ((0, typeguards_1.isObject)(dep)) {
                const key = Object.keys(dep)[0];
                if (key)
                    ret[key] = dep[key] || "latest";
            }
        }
    }
    return ret;
}
exports.getAdapterDependencies = getAdapterDependencies;
