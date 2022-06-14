"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoggerMock = void 0;
const sinon_1 = require("sinon");
const tools_1 = require("./tools");
// Define here which methods were implemented manually, so we can hook them up with a real stub
// The value describes if and how the async version of the callback is constructed
const implementedMethods = {};
/**
 * Creates an adapter mock that is connected to a given database mock
 */
function createLoggerMock() {
    const ret = {
        info: (0, sinon_1.stub)(),
        warn: (0, sinon_1.stub)(),
        error: (0, sinon_1.stub)(),
        debug: (0, sinon_1.stub)(),
        silly: (0, sinon_1.stub)(),
        level: "info",
        // Mock-specific methods
        resetMockHistory() {
            // reset Logger
            (0, tools_1.doResetHistory)(ret);
        },
        resetMockBehavior() {
            // reset Logger
            (0, tools_1.doResetBehavior)(ret, implementedMethods);
        },
        resetMock() {
            ret.resetMockHistory();
            ret.resetMockBehavior();
        },
    };
    (0, tools_1.stubAndPromisifyImplementedMethods)(ret, implementedMethods);
    return ret;
}
exports.createLoggerMock = createLoggerMock;
