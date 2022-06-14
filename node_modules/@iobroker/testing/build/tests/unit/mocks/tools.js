"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stubAndPromisifyImplementedMethods = exports.doResetBehavior = exports.doResetHistory = void 0;
const async_1 = require("alcalzone-shared/async");
const sinon_1 = require("sinon");
function doResetHistory(parent) {
    for (const prop of Object.keys(parent)) {
        const val = parent[prop];
        if (val && typeof val.resetHistory === "function")
            val.resetHistory();
    }
}
exports.doResetHistory = doResetHistory;
function doResetBehavior(parent, implementedMethods) {
    for (const prop of Object.keys(parent)) {
        if (prop in implementedMethods ||
            (prop.endsWith("Async") && prop.slice(0, -5) in implementedMethods))
            continue;
        const val = parent[prop];
        if (val && typeof val.resetBehavior === "function")
            val.resetBehavior();
    }
}
exports.doResetBehavior = doResetBehavior;
function dontOverwriteThis() {
    throw new Error("You must not overwrite the behavior of this stub!");
}
function stubAndPromisifyImplementedMethods(parent, implementedMethods, allowUserOverrides = []) {
    // The methods implemented above are no stubs, but we claimed they are
    // Therefore hook them up with a real stub
    for (const methodName of Object.keys(implementedMethods)) {
        if (methodName.endsWith("Async"))
            continue;
        const originalMethod = parent[methodName];
        const callbackFake = (parent[methodName] = (0, sinon_1.stub)());
        callbackFake.callsFake(originalMethod);
        // Prevent the user from changing the stub's behavior
        if (allowUserOverrides.indexOf(methodName) === -1) {
            callbackFake.returns = dontOverwriteThis;
            callbackFake.callsFake = dontOverwriteThis;
        }
        // Construct the async fake if there's any
        const asyncType = implementedMethods[methodName];
        if (asyncType === "none")
            continue;
        const promisifyMethod = asyncType === "no error" ? async_1.promisifyNoError : async_1.promisify;
        const asyncFake = (0, sinon_1.stub)().callsFake(promisifyMethod(originalMethod, parent));
        parent[`${methodName}Async`] = asyncFake;
        // Prevent the user from changing the stub's behavior
        if (allowUserOverrides.indexOf(methodName) === -1 ||
            allowUserOverrides.indexOf((methodName + "Async")) === -1) {
            asyncFake.returns = dontOverwriteThis;
            asyncFake.callsFake = dontOverwriteThis;
        }
    }
}
exports.stubAndPromisifyImplementedMethods = stubAndPromisifyImplementedMethods;
