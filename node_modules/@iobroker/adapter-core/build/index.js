"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXIT_CODES = exports.getAbsoluteInstanceDataDir = exports.getAbsoluteDefaultDataDir = void 0;
const path = require("path");
const utils = require("./utils");
/* eslint-disable @typescript-eslint/no-var-requires */
// Export all methods that used to be in utils.js
__exportStar(require("./utils"), exports);
// Export some additional utility methods
const controllerTools = require(path.join(utils.controllerDir, "lib/tools"));
/**
 * Returns the absolute path of the data directory for the current host. On linux, this is usually `/opt/iobroker/iobroker-data`.
 */
function getAbsoluteDefaultDataDir() {
    return path.join(utils.controllerDir, controllerTools.getDefaultDataDir());
}
exports.getAbsoluteDefaultDataDir = getAbsoluteDefaultDataDir;
/**
 * Returns the absolute path of the data directory for the current adapter instance.
 * On linux, this is usually `/opt/iobroker/iobroker-data/<adapterName>.<instanceNr>`
 */
function getAbsoluteInstanceDataDir(adapterObject) {
    return path.join(getAbsoluteDefaultDataDir(), adapterObject.namespace);
}
exports.getAbsoluteInstanceDataDir = getAbsoluteInstanceDataDir;
// TODO: Expose some system utilities here, e.g. for installing npm modules (GH#1)
exports.EXIT_CODES = Object.freeze(Object.assign({}, require(path.join(utils.controllerDir, "lib/exitCodes"))));
