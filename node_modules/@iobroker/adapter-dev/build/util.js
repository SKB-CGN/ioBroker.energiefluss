"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interceptErrors = exports.die = exports.error = exports.padRight = exports.escapeRegExp = void 0;
const ansi_colors_1 = require("ansi-colors");
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
exports.escapeRegExp = escapeRegExp;
function padRight(text, totalLength) {
    return text.padEnd(totalLength, " ");
}
exports.padRight = padRight;
function error(message) {
    console.error(ansi_colors_1.bold.red(message));
    console.error();
}
exports.error = error;
function die(message) {
    console.error((0, ansi_colors_1.red)(message));
    process.exit(1);
}
exports.die = die;
function interceptErrors(func) {
    return async () => {
        try {
            await func();
        }
        catch (error) {
            die(error.stack || error);
        }
    };
}
exports.interceptErrors = interceptErrors;
//# sourceMappingURL=util.js.map