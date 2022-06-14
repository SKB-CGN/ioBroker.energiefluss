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
exports.TestHarness = void 0;
/* eslint-disable @typescript-eslint/no-inferrable-types */
const async_1 = require("alcalzone-shared/async");
const objects_1 = require("alcalzone-shared/objects");
const child_process_1 = require("child_process");
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const path = __importStar(require("path"));
const adapterTools_1 = require("../../../lib/adapterTools");
const tools_1 = require("./tools");
const debug = (0, debug_1.default)("testing:integration:TestHarness");
const isWindows = /^win/.test(process.platform);
const fromAdapterID = "system.adapter.test.0";
/**
 * The test harness capsules the execution of the JS-Controller and the adapter instance and monitors their status.
 * Use it in every test to start a fresh adapter instance
 */
class TestHarness extends events_1.EventEmitter {
    /**
     * @param adapterDir The root directory of the adapter
     * @param testDir The directory the integration tests are executed in
     */
    constructor(adapterDir, testDir, dbConnection) {
        super();
        this.adapterDir = adapterDir;
        this.testDir = testDir;
        this.dbConnection = dbConnection;
        this.sendToID = 1;
        debug("Creating instance");
        this.adapterName = (0, adapterTools_1.getAdapterName)(this.adapterDir);
        this.appName = (0, adapterTools_1.getAppName)(adapterDir);
        this.testControllerDir = (0, tools_1.getTestControllerDir)(this.appName, testDir);
        this.testAdapterDir = (0, tools_1.getTestAdapterDir)(this.adapterDir, testDir);
        debug(`  directories:`);
        debug(`    controller: ${this.testControllerDir}`);
        debug(`    adapter:    ${this.testAdapterDir}`);
        debug(`  appName:           ${this.appName}`);
        debug(`  adapterName:       ${this.adapterName}`);
        dbConnection.on("objectChange", (id, obj) => {
            this.emit("objectChange", id, obj);
        });
        dbConnection.on("stateChange", (id, state) => {
            this.emit("stateChange", id, state);
        });
    }
    /** Gives direct access to the Objects DB */
    get objects() {
        if (!this.dbConnection.objectsClient) {
            throw new Error("Objects DB is not running");
        }
        return this.dbConnection.objectsClient;
    }
    /** Gives direct access to the States DB */
    get states() {
        if (!this.dbConnection.statesClient) {
            throw new Error("States DB is not running");
        }
        return this.dbConnection.statesClient;
    }
    /** The process the adapter is running in */
    get adapterProcess() {
        return this._adapterProcess;
    }
    /** Contains the adapter exit code or signal if it was terminated unexpectedly */
    get adapterExit() {
        return this._adapterExit;
    }
    /** Checks if the controller instance is running */
    isControllerRunning() {
        // The "controller instance" is just the databases, so if they are running,
        // the "controller" is.
        return this.dbConnection.isRunning;
    }
    /** Starts the controller instance by creating the databases */
    async startController() {
        await this.dbConnection.start();
    }
    /** Stops the controller instance (and the adapter if it is running) */
    async stopController() {
        if (!this.isControllerRunning())
            return;
        if (!this.didAdapterStop()) {
            debug("Stopping adapter instance...");
            // Give the adapter time to stop (as long as configured in the io-package.json)
            let stopTimeout;
            try {
                stopTimeout = (await this.dbConnection.getObject(`system.adapter.${this.adapterName}.0`)).common.stopTimeout;
                stopTimeout += 1000;
            }
            catch { }
            stopTimeout || (stopTimeout = 5000); // default 5s
            debug(`  => giving it ${stopTimeout}ms to terminate`);
            await Promise.race([this.stopAdapter(), (0, async_1.wait)(stopTimeout)]);
            if (this.isAdapterRunning()) {
                debug("Adapter did not terminate, killing it");
                this._adapterProcess.kill("SIGKILL");
            }
            else {
                debug("Adapter terminated");
            }
        }
        else {
            debug("Adapter failed to start - no need to terminate!");
        }
        await this.dbConnection.stop();
    }
    /**
     * Starts the adapter in a separate process and monitors its status
     * @param env Additional environment variables to set
     */
    async startAdapter(env = {}) {
        if (this.isAdapterRunning())
            throw new Error("The adapter is already running!");
        else if (this.didAdapterStop())
            throw new Error("This test harness has already been used. Please create a new one for each test!");
        const mainFileAbsolute = await (0, adapterTools_1.locateAdapterMainFile)(this.testAdapterDir);
        const mainFileRelative = path.relative(this.testAdapterDir, mainFileAbsolute);
        const onClose = (code, signal) => {
            this._adapterProcess.removeAllListeners();
            this._adapterExit = code != undefined ? code : signal;
            this.emit("failed", this._adapterExit);
        };
        this._adapterProcess = (0, child_process_1.spawn)(isWindows ? "node.exe" : "node", [mainFileRelative, "--console"], {
            cwd: this.testAdapterDir,
            stdio: ["inherit", "inherit", "inherit"],
            env: { ...process.env, ...env },
        })
            .on("close", onClose)
            .on("exit", onClose);
    }
    /**
     * Starts the adapter in a separate process and resolves after it has started
     * @param waitForConnection By default, the test will wait for the adapter's `alive` state to become true. Set this to `true` to wait for the `info.connection` state instead.
     * @param env Additional environment variables to set
     */
    async startAdapterAndWait(waitForConnection = false, env = {}) {
        return new Promise((resolve, reject) => {
            const waitForStateId = waitForConnection
                ? `${this.adapterName}.0.info.connection`
                : `system.adapter.${this.adapterName}.0.alive`;
            this.on("stateChange", async (id, state) => {
                if (id === waitForStateId && state && state.val === true) {
                    resolve();
                }
            })
                .on("failed", (code) => {
                reject(new Error(`The adapter startup was interrupted unexpectedly with ${typeof code === "number" ? "code" : "signal"} ${code}`));
            })
                .startAdapter(env);
        });
    }
    /** Tests if the adapter process is still running */
    isAdapterRunning() {
        return !!this._adapterProcess;
    }
    /** Tests if the adapter process has already exited */
    didAdapterStop() {
        return this._adapterExit != undefined;
    }
    /** Stops the adapter process */
    stopAdapter() {
        if (!this.isAdapterRunning())
            return;
        return new Promise(async (resolve) => {
            var _a;
            const onClose = (code, signal) => {
                if (!this._adapterProcess)
                    return;
                this._adapterProcess.removeAllListeners();
                this._adapterExit = code != undefined ? code : signal;
                this._adapterProcess = undefined;
                debug("Adapter process terminated:");
                debug(`  Code:   ${code}`);
                debug(`  Signal: ${signal}`);
                resolve();
            };
            this._adapterProcess.removeAllListeners()
                .on("close", onClose)
                .on("exit", onClose);
            // Tell adapter to stop
            try {
                await this.dbConnection.setState(`system.adapter.${this.adapterName}.0.sigKill`, {
                    val: -1,
                    from: "system.host.testing",
                });
            }
            catch {
                // DB connection may be closed already, kill the process
                (_a = this._adapterProcess) === null || _a === void 0 ? void 0 : _a.kill("SIGTERM");
            }
        });
    }
    /**
     * Updates the adapter config. The changes can be a subset of the target object
     */
    async changeAdapterConfig(adapterName, changes) {
        const adapterInstanceId = `system.adapter.${adapterName}.0`;
        const obj = await this.dbConnection.getObject(adapterInstanceId);
        if (obj) {
            (0, objects_1.extend)(obj, changes);
            await this.dbConnection.setObject(adapterInstanceId, obj);
        }
    }
    getAdapterExecutionMode() {
        return (0, adapterTools_1.getAdapterExecutionMode)(this.testAdapterDir);
    }
    /** Enables the sendTo method */
    async enableSendTo() {
        await this.dbConnection.setObject(fromAdapterID, {
            type: "instance",
            common: {},
            native: {},
        });
        this.dbConnection.subscribeMessage(fromAdapterID);
    }
    /** Sends a message to an adapter instance */
    sendTo(target, command, message, callback) {
        const stateChangedHandler = (id, state) => {
            if (id === `messagebox.${fromAdapterID}`) {
                callback(state.message);
                this.removeListener("stateChange", stateChangedHandler);
            }
        };
        this.addListener("stateChange", stateChangedHandler);
        this.dbConnection.pushMessage(`system.adapter.${target}`, {
            command: command,
            message: message,
            from: fromAdapterID,
            callback: {
                message: message,
                id: this.sendToID++,
                ack: false,
                time: Date.now(),
            },
        }, (err, id) => console.log("published message " + id));
    }
}
exports.TestHarness = TestHarness;
