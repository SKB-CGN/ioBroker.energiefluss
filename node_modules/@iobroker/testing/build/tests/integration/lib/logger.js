"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
var LoglevelOrder;
(function (LoglevelOrder) {
    LoglevelOrder[LoglevelOrder["error"] = 0] = "error";
    LoglevelOrder[LoglevelOrder["warn"] = 1] = "warn";
    LoglevelOrder[LoglevelOrder["info"] = 2] = "info";
    LoglevelOrder[LoglevelOrder["debug"] = 3] = "debug";
    LoglevelOrder[LoglevelOrder["silly"] = 4] = "silly";
})(LoglevelOrder || (LoglevelOrder = {}));
function createLogger(loglevel) {
    var _a;
    const loglevelNumeric = (_a = LoglevelOrder[loglevel !== null && loglevel !== void 0 ? loglevel : "debug"]) !== null && _a !== void 0 ? _a : LoglevelOrder.debug;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const ignore = () => { };
    return {
        error: loglevelNumeric >= LoglevelOrder.error ? console.error : ignore,
        warn: loglevelNumeric >= LoglevelOrder.warn ? console.warn : ignore,
        info: loglevelNumeric >= LoglevelOrder.info ? console.log : ignore,
        debug: loglevelNumeric >= LoglevelOrder.debug ? console.log : ignore,
        silly: loglevelNumeric >= LoglevelOrder.silly ? console.log : ignore,
        level: loglevel,
    };
}
exports.createLogger = createLogger;
