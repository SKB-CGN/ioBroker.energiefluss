"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = exports.adapter = exports.getConfig = exports.controllerDir = void 0;
const fs = require("fs");
const path = require("path");
/**
 * Resolves the root directory of JS-Controller and returns it or exits the process
 * @param isInstall Whether the adapter is run in "install" mode or if it should execute normally
 */
function getControllerDir(isInstall) {
    // Find the js-controller location
    const possibilities = ["iobroker.js-controller", "ioBroker.js-controller"];
    let controllerPath;
    // First try to let Node.js resolve the package by itself
    for (const pkg of possibilities) {
        try {
            const possiblePath = require.resolve(pkg);
            if (fs.existsSync(possiblePath)) {
                // require.resolve returns the main file, we want the directory
                controllerPath = path.dirname(possiblePath);
                break;
            }
        }
        catch (_a) {
            /* not found */
        }
    }
    // As a fallback solution, we walk up the directory tree until we reach the root or find js-controller
    // Apparently, checking vs null/undefined may miss the odd case of controllerPath being ""
    // Thus we check for falsyness, which includes failing on an empty path
    if (!controllerPath) {
        let curDir = path.join(__dirname, "../node_modules");
        let parentDir;
        outer: while (true) {
            for (const pkg of possibilities) {
                const possiblePath = path.join(curDir, pkg);
                try {
                    if (fs.existsSync(possiblePath)) {
                        controllerPath = possiblePath;
                        break outer;
                    }
                }
                catch (_b) {
                    // don't care
                }
            }
            // Nothing found here, go up one level
            parentDir = path.dirname(curDir);
            if (parentDir === curDir) {
                // we've reached the root without finding js-controller
                break;
            }
            curDir = parentDir;
        }
    }
    if (!controllerPath) {
        if (!isInstall) {
            console.log("Cannot find js-controller");
            return process.exit(10);
        }
        else {
            return process.exit();
        }
    }
    // we found the controller
    return controllerPath;
}
/** The root directory of JS-Controller */
exports.controllerDir = getControllerDir(!!((_a = process === null || process === void 0 ? void 0 : process.argv) === null || _a === void 0 ? void 0 : _a.includes("--install")));
/** Reads the configuration file of JS-Controller */
function getConfig() {
    return JSON.parse(fs.readFileSync(path.join(exports.controllerDir, "conf/iobroker.json"), "utf8"));
}
exports.getConfig = getConfig;
/** Creates a new adapter instance */
exports.adapter = require(path.join(exports.controllerDir, "lib/adapter.js"));
/** Creates a new adapter instance */
exports.Adapter = exports.adapter;
