"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdapterMock = void 0;
const objects_1 = require("alcalzone-shared/objects");
const sinon_1 = require("sinon");
const mockLogger_1 = require("./mockLogger");
const tools_1 = require("./tools");
// Define here which methods were implemented manually, so we can hook them up with a real stub
// The value describes if and how the async version of the callback is constructed
const implementedMethods = {
    getObject: "normal",
    setObject: "normal",
    setObjectNotExists: "normal",
    extendObject: "normal",
    getForeignObject: "normal",
    getForeignObjects: "normal",
    setForeignObject: "normal",
    setForeignObjectNotExists: "normal",
    extendForeignObject: "normal",
    getState: "normal",
    getStates: "normal",
    setState: "normal",
    setStateChanged: "normal",
    delState: "normal",
    getForeignState: "normal",
    setForeignState: "normal",
    setForeignStateChanged: "normal",
    subscribeStates: "normal",
    subscribeForeignStates: "normal",
    subscribeObjects: "normal",
    subscribeForeignObjects: "normal",
    getAdapterObjects: "no error",
    getObjectView: "normal",
    getObjectList: "normal",
    on: "none",
    removeListener: "none",
    removeAllListeners: "none",
    terminate: "none",
    getPort: "no error",
    checkPassword: "no error",
    setPassword: "normal",
    checkGroup: "no error",
    calculatePermissions: "no error",
    getCertificates: "normal",
    sendTo: "no error",
    sendToHost: "no error",
    getHistory: "normal",
    setBinaryState: "normal",
    getBinaryState: "normal",
    getEnum: "normal",
    getEnums: "normal",
    addChannelToEnum: "normal",
    deleteChannelFromEnum: "normal",
    addStateToEnum: "normal",
    deleteStateFromEnum: "normal",
    createDevice: "normal",
    deleteDevice: "normal",
    createChannel: "normal",
    deleteChannel: "normal",
    createState: "normal",
    deleteState: "normal",
    getDevices: "normal",
    getChannelsOf: "normal",
    getStatesOf: "normal",
    readDir: "normal",
    mkDir: "normal",
    readFile: "normal",
    writeFile: "normal",
    delFile: "normal",
    unlink: "normal",
    rename: "normal",
    chmodFile: "normal",
};
function getCallback(...args) {
    const lastArg = args[args.length - 1];
    if (typeof lastArg === "function")
        return lastArg;
}
/** Stub implementation which can be promisified */
const asyncEnabledStub = ((...args) => {
    const callback = getCallback(...args);
    if (typeof callback === "function")
        callback();
});
/**
 * Creates an adapter mock that is connected to a given database mock
 */
function createAdapterMock(db, options = {}) {
    // In order to support ES6-style adapters with inheritance, we need to work on the instance directly
    const ret = this || {};
    Object.assign(ret, {
        name: options.name || "test",
        host: "testhost",
        instance: options.instance || 0,
        namespace: `${options.name || "test"}.${options.instance || 0}`,
        config: options.config || {},
        common: {},
        systemConfig: null,
        adapterDir: "",
        ioPack: {},
        pack: {},
        log: (0, mockLogger_1.createLoggerMock)(),
        version: "any",
        connected: true,
        getPort: asyncEnabledStub,
        stop: (0, sinon_1.stub)(),
        checkPassword: asyncEnabledStub,
        setPassword: asyncEnabledStub,
        checkGroup: asyncEnabledStub,
        calculatePermissions: asyncEnabledStub,
        getCertificates: asyncEnabledStub,
        sendTo: asyncEnabledStub,
        sendToHost: asyncEnabledStub,
        idToDCS: (0, sinon_1.stub)(),
        getObject: ((id, ...args) => {
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            const callback = getCallback(...args);
            if (callback)
                callback(null, db.getObject(id));
        }),
        setObject: ((id, obj, ...args) => {
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            obj._id = id;
            db.publishObject(obj);
            const callback = getCallback(...args);
            if (callback)
                callback(null, { id });
        }),
        setObjectNotExists: ((id, obj, ...args) => {
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            const callback = getCallback(...args);
            if (db.hasObject(id)) {
                if (callback)
                    callback(null, { id });
            }
            else {
                ret.setObject(id, obj, callback);
            }
        }),
        getAdapterObjects: ((callback) => {
            callback(db.getObjects(`${ret.namespace}.*`));
        }),
        getObjectView: ((design, search, { startkey, endkey }, ...args) => {
            if (design !== "system") {
                throw new Error("If you want to use a custom design for getObjectView, you need to mock it yourself!");
            }
            const callback = getCallback(...args);
            if (typeof callback === "function") {
                let objects = (0, objects_1.values)(db.getObjects("*"));
                objects = objects.filter((obj) => obj.type === search);
                if (startkey)
                    objects = objects.filter((obj) => obj._id >= startkey);
                if (endkey)
                    objects = objects.filter((obj) => obj._id <= endkey);
                callback(null, {
                    rows: objects.map((obj) => ({
                        id: obj._id,
                        value: obj,
                    })),
                });
            }
        }),
        getObjectList: (({ startkey, endkey, include_docs, }, ...args) => {
            const callback = getCallback(...args);
            if (typeof callback === "function") {
                let objects = (0, objects_1.values)(db.getObjects("*"));
                if (startkey)
                    objects = objects.filter((obj) => obj._id >= startkey);
                if (endkey)
                    objects = objects.filter((obj) => obj._id <= endkey);
                if (!include_docs)
                    objects = objects.filter((obj) => !obj._id.startsWith("_"));
                callback(null, {
                    rows: objects.map((obj) => ({
                        id: obj._id,
                        value: obj,
                        doc: obj,
                    })),
                });
            }
        }),
        extendObject: ((id, obj, ...args) => {
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            const existing = db.getObject(id) || {};
            const target = (0, objects_1.extend)({}, existing, obj);
            target._id = id;
            db.publishObject(target);
            const callback = getCallback(...args);
            if (callback)
                callback(null, { id: target._id, value: target }, id);
        }),
        delObject: ((id, ...args) => {
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            db.deleteObject(id);
            const callback = getCallback(...args);
            if (callback)
                callback(undefined);
        }),
        getForeignObject: ((id, ...args) => {
            const callback = getCallback(...args);
            if (callback)
                callback(null, db.getObject(id));
        }),
        getForeignObjects: ((pattern, ...args) => {
            const type = typeof args[0] === "string"
                ? args[0]
                : undefined;
            const callback = getCallback(...args);
            if (callback)
                callback(null, db.getObjects(pattern, type));
        }),
        setForeignObject: ((id, obj, ...args) => {
            obj._id = id;
            db.publishObject(obj);
            const callback = getCallback(...args);
            if (callback)
                callback(null, { id });
        }),
        setForeignObjectNotExists: ((id, obj, ...args) => {
            const callback = getCallback(...args);
            if (db.hasObject(id)) {
                if (callback)
                    callback(null, { id });
            }
            else {
                ret.setObject(id, obj, callback);
            }
        }),
        extendForeignObject: ((id, obj, ...args) => {
            const target = db.getObject(id) || {};
            Object.assign(target, obj);
            target._id = id;
            db.publishObject(target);
            const callback = getCallback(...args);
            if (callback)
                callback(null, { id: target._id, value: target }, id);
        }),
        findForeignObject: (0, sinon_1.stub)(),
        delForeignObject: ((id, ...args) => {
            db.deleteObject(id);
            const callback = getCallback(...args);
            if (callback)
                callback(undefined);
        }),
        setState: ((id, state, ...args) => {
            const callback = getCallback(...args);
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            let ack;
            if (state != null && typeof state === "object") {
                ack = !!state.ack;
                state = state.val;
            }
            else {
                ack = typeof args[0] === "boolean" ? args[0] : false;
            }
            db.publishState(id, { val: state, ack });
            if (callback)
                callback(null, id);
        }),
        setStateChanged: ((id, state, ...args) => {
            const callback = getCallback(...args);
            let ack;
            if (state != null && typeof state === "object") {
                ack = !!state.ack;
                state = state.val;
            }
            else {
                ack = typeof args[0] === "boolean" ? args[0] : false;
            }
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            if (!db.hasState(id) || db.getState(id).val !== state) {
                db.publishState(id, { val: state, ack });
            }
            if (callback)
                callback(null, id);
        }),
        setForeignState: ((id, state, ...args) => {
            const callback = getCallback(...args);
            let ack;
            if (state != null && typeof state === "object") {
                ack = !!state.ack;
                state = state.val;
            }
            else {
                ack = typeof args[0] === "boolean" ? args[0] : false;
            }
            db.publishState(id, { val: state, ack });
            if (callback)
                callback(null, id);
        }),
        setForeignStateChanged: ((id, state, ...args) => {
            const callback = getCallback(...args);
            let ack;
            if (state != null && typeof state === "object") {
                ack = !!state.ack;
                state = state.val;
            }
            else {
                ack = typeof args[0] === "boolean" ? args[0] : false;
            }
            if (!db.hasState(id) || db.getState(id).val !== state) {
                db.publishState(id, { val: state, ack });
            }
            if (callback)
                callback(null, id);
        }),
        getState: ((id, ...args) => {
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            const callback = getCallback(...args);
            if (callback)
                callback(null, db.getState(id));
        }),
        getForeignState: ((id, ...args) => {
            const callback = getCallback(...args);
            if (callback)
                callback(null, db.getState(id));
        }),
        getStates: ((pattern, ...args) => {
            if (!pattern.startsWith(ret.namespace))
                pattern = ret.namespace + "." + pattern;
            const callback = getCallback(...args);
            if (callback)
                callback(null, db.getStates(pattern));
        }),
        getForeignStates: ((pattern, ...args) => {
            const callback = getCallback(...args);
            if (callback)
                callback(null, db.getStates(pattern));
        }),
        delState: ((id, ...args) => {
            if (!id.startsWith(ret.namespace))
                id = ret.namespace + "." + id;
            db.deleteState(id);
            const callback = getCallback(...args);
            if (callback)
                callback(undefined);
        }),
        delForeignState: ((id, ...args) => {
            db.deleteState(id);
            const callback = getCallback(...args);
            if (callback)
                callback(undefined);
        }),
        getHistory: asyncEnabledStub,
        setBinaryState: asyncEnabledStub,
        getBinaryState: asyncEnabledStub,
        getEnum: asyncEnabledStub,
        getEnums: asyncEnabledStub,
        addChannelToEnum: asyncEnabledStub,
        deleteChannelFromEnum: asyncEnabledStub,
        addStateToEnum: asyncEnabledStub,
        deleteStateFromEnum: asyncEnabledStub,
        subscribeObjects: asyncEnabledStub,
        subscribeForeignObjects: asyncEnabledStub,
        unsubscribeObjects: asyncEnabledStub,
        unsubscribeForeignObjects: asyncEnabledStub,
        subscribeStates: asyncEnabledStub,
        subscribeForeignStates: asyncEnabledStub,
        unsubscribeStates: asyncEnabledStub,
        unsubscribeForeignStates: asyncEnabledStub,
        createDevice: asyncEnabledStub,
        deleteDevice: asyncEnabledStub,
        createChannel: asyncEnabledStub,
        deleteChannel: asyncEnabledStub,
        createState: asyncEnabledStub,
        deleteState: asyncEnabledStub,
        getDevices: asyncEnabledStub,
        getChannels: (0, sinon_1.stub)(),
        getChannelsOf: asyncEnabledStub,
        getStatesOf: asyncEnabledStub,
        readDir: asyncEnabledStub,
        mkDir: asyncEnabledStub,
        readFile: asyncEnabledStub,
        writeFile: asyncEnabledStub,
        delFile: asyncEnabledStub,
        unlink: asyncEnabledStub,
        rename: asyncEnabledStub,
        chmodFile: asyncEnabledStub,
        formatValue: (0, sinon_1.stub)(),
        formatDate: (0, sinon_1.stub)(),
        terminate: ((reason, exitCode) => {
            if (typeof reason === "number") {
                // Only the exit code was passed
                exitCode = reason;
                reason = undefined;
            }
            const errorMessage = `Adapter.terminate was called${typeof exitCode === "number" ? ` (exit code ${exitCode})` : ""}: ${reason ? reason : "Without reason"}`;
            // Terminates execution by
            const err = new Error(errorMessage);
            // @ts-expect-error I'm too lazy to add terminateReason to the error type
            err.terminateReason = reason || "no reason given!";
            throw err;
        }),
        supportsFeature: (0, sinon_1.stub)(),
        getPluginInstance: (0, sinon_1.stub)(),
        getPluginConfig: (0, sinon_1.stub)(),
        // EventEmitter methods
        on: ((event, handler) => {
            // Remember the event handlers so we can call them on demand
            switch (event) {
                case "ready":
                    ret.readyHandler = handler;
                    break;
                case "message":
                    ret.messageHandler = handler;
                    break;
                case "objectChange":
                    ret.objectChangeHandler = handler;
                    break;
                case "stateChange":
                    ret.stateChangeHandler = handler;
                    break;
                case "unload":
                    ret.unloadHandler = handler;
                    break;
            }
            return ret;
        }),
        removeListener: ((event, _listener) => {
            // TODO This is not entirely correct
            switch (event) {
                case "ready":
                    ret.readyHandler = undefined;
                    break;
                case "message":
                    ret.messageHandler = undefined;
                    break;
                case "objectChange":
                    ret.objectChangeHandler = undefined;
                    break;
                case "stateChange":
                    ret.stateChangeHandler = undefined;
                    break;
                case "unload":
                    ret.unloadHandler = undefined;
                    break;
            }
            return ret;
        }),
        removeAllListeners: ((event) => {
            if (!event || event === "ready") {
                ret.readyHandler = undefined;
            }
            if (!event || event === "message") {
                ret.messageHandler = undefined;
            }
            if (!event || event === "objectChange") {
                ret.objectChangeHandler = undefined;
            }
            if (!event || event === "stateChange") {
                ret.stateChangeHandler = undefined;
            }
            if (!event || event === "unload") {
                ret.unloadHandler = undefined;
            }
            return ret;
        }),
        // Mock-specific methods
        resetMockHistory() {
            // reset Adapter
            (0, tools_1.doResetHistory)(ret);
            ret.log.resetMockHistory();
        },
        resetMockBehavior() {
            // reset Adapter
            (0, tools_1.doResetBehavior)(ret, implementedMethods);
            ret.log.resetMockBehavior();
        },
        resetMock() {
            ret.resetMockHistory();
            ret.resetMockBehavior();
        },
    });
    (0, tools_1.stubAndPromisifyImplementedMethods)(ret, implementedMethods, [
        "getObjectView",
        "getObjectList",
    ]);
    // Access the options object directly, so we can react to later changes
    Object.defineProperties(ret, {
        readyHandler: {
            get() {
                return options.ready;
            },
            set(handler) {
                options.ready = handler;
            },
        },
        messageHandler: {
            get() {
                return options.message;
            },
            set(handler) {
                options.message = handler;
            },
        },
        objectChangeHandler: {
            get() {
                return options.objectChange;
            },
            set(handler) {
                options.objectChange = handler;
            },
        },
        stateChangeHandler: {
            get() {
                return options.stateChange;
            },
            set(handler) {
                options.stateChange = handler;
            },
        },
        unloadHandler: {
            get() {
                return options.unload;
            },
            set(handler) {
                options.unload = handler;
            },
        },
    });
    return ret;
}
exports.createAdapterMock = createAdapterMock;
