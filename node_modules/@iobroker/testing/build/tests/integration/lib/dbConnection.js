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
exports.DBConnection = void 0;
const debug_1 = __importDefault(require("debug"));
const events_1 = __importDefault(require("events"));
const fs_extra_1 = require("fs-extra");
const path = __importStar(require("path"));
const tools_1 = require("./tools");
const debug = (0, debug_1.default)("testing:integration:DBConnection");
/** The DB connection capsules access to the states and objects DB */
class DBConnection extends events_1.default {
    /**
     * @param appName The branded name of "iobroker"
     * @param testDir The directory the integration tests are executed in
     */
    constructor(appName, testDir, logger) {
        super();
        this.appName = appName;
        this.testDir = testDir;
        this.logger = logger;
        this._isRunning = false;
        this.getObject = async (id) => {
            if (!this._objectsClient) {
                throw new Error("Objects DB is not running");
            }
            return this._objectsClient.getObjectAsync(id);
        };
        this.setObject = async (...args) => {
            if (!this._objectsClient) {
                throw new Error("Objects DB is not running");
            }
            return this._objectsClient.setObjectAsync(...args);
        };
        this.delObject = async (...args) => {
            if (!this._objectsClient) {
                throw new Error("Objects DB is not running");
            }
            return this._objectsClient.delObjectAsync(...args);
        };
        this.getState = async (id) => {
            if (!this._statesClient) {
                throw new Error("States DB is not running");
            }
            return this._statesClient.getStateAsync(id);
        };
        this.setState = (async (...args) => {
            if (!this._statesClient) {
                throw new Error("States DB is not running");
            }
            return this._statesClient.setStateAsync(...args);
        });
        this.delState = async (...args) => {
            if (!this._statesClient) {
                throw new Error("States DB is not running");
            }
            return this._statesClient.delStateAsync(...args);
        };
        this.getObjectViewAsync = async (...args) => {
            if (!this._objectsClient) {
                throw new Error("Objects DB is not running");
            }
            return this._objectsClient.getObjectViewAsync(...args);
        };
        this.testControllerDir = (0, tools_1.getTestControllerDir)(this.appName, testDir);
        this.testDataDir = (0, tools_1.getTestDataDir)(appName, testDir);
    }
    /** The underlying objects client instance that can be used to access the objects DB */
    get objectsClient() {
        return this._objectsClient;
    }
    /** The underlying states client instance that can be used to access the states DB */
    get statesClient() {
        return this._statesClient;
    }
    get objectsType() {
        return this.getSystemConfig().objects.type;
    }
    get objectsPath() {
        return path.join(this.testDataDir, this.objectsType === "file" ? "objects.json" : "objects.jsonl");
    }
    get statesType() {
        return this.getSystemConfig().states.type;
    }
    get statesPath() {
        return path.join(this.testDataDir, this.statesType === "file" ? "states.json" : "states.jsonl");
    }
    getSystemConfig() {
        const systemFilename = path.join(this.testDataDir, `${this.appName}.json`);
        return (0, fs_extra_1.readJSONSync)(systemFilename);
    }
    async backup() {
        debug("Creating DB backup...");
        const wasRunning = this._isRunning;
        await this.stop();
        const objects = await (0, fs_extra_1.readFile)(this.objectsPath);
        const states = await (0, fs_extra_1.readFile)(this.statesPath);
        if (wasRunning)
            await this.start();
        return { objects, states };
    }
    async restore(objects, states) {
        debug("Restoring DB backup...");
        const wasRunning = this._isRunning;
        await this.stop();
        await (0, fs_extra_1.writeFile)(this.objectsPath, objects);
        await (0, fs_extra_1.writeFile)(this.statesPath, states);
        if (wasRunning)
            await this.start();
    }
    setSystemConfig(systemConfig) {
        const systemFilename = path.join(this.testDataDir, `${this.appName}.json`);
        (0, fs_extra_1.writeJSONSync)(systemFilename, systemConfig, { spaces: 2 });
    }
    get isRunning() {
        return this._isRunning;
    }
    async start() {
        if (this._isRunning) {
            debug("At least one DB instance is already running, not starting again...");
            return;
        }
        debug("starting DB instances...");
        await this.createObjectsDB();
        await this.createStatesDB();
        this._isRunning = true;
        debug("DB instances started");
    }
    async stop() {
        var _a, _b, _c, _d;
        if (!this._isRunning) {
            debug("No DB instance is running, nothing to stop...");
            return;
        }
        debug("Stopping DB instances...");
        // Stop clients before servers
        await ((_a = this._objectsClient) === null || _a === void 0 ? void 0 : _a.destroy());
        await ((_b = this._objectsServer) === null || _b === void 0 ? void 0 : _b.destroy());
        await ((_c = this._statesClient) === null || _c === void 0 ? void 0 : _c.destroy());
        await ((_d = this._statesServer) === null || _d === void 0 ? void 0 : _d.destroy());
        this._objectsClient = null;
        this._objectsServer = null;
        this._statesClient = null;
        this._statesServer = null;
        this._isRunning = false;
        debug("DB instances stopped");
    }
    /** Creates the objects DB and sets up listeners for it */
    async createObjectsDB() {
        debug("creating objects DB");
        const objectsType = this.objectsType;
        debug(`  => objects DB type: ${objectsType}`);
        const settings = {
            connection: {
                type: objectsType,
                host: "127.0.0.1",
                port: 19001,
                user: "",
                pass: "",
                noFileCache: false,
                connectTimeout: 2000,
            },
            logger: this.logger,
        };
        const objectsDbPath = require.resolve(`@iobroker/db-objects-${objectsType}`, {
            paths: [
                path.join(this.testDir, "node_modules"),
                path.join(this.testControllerDir, "node_modules"),
            ],
        });
        debug(`  => objects DB lib found at ${objectsDbPath}`);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Server, Client } = require(objectsDbPath);
        // First create the server
        await new Promise((resolve) => {
            this._objectsServer = new Server({
                ...settings,
                connected: () => {
                    resolve();
                },
            });
        });
        // Then the client
        await new Promise((resolve) => {
            this._objectsClient = new Client({
                ...settings,
                connected: () => {
                    this._objectsClient.subscribe("*");
                    resolve();
                },
                change: this.emit.bind(this, "objectChange"),
            });
        });
        debug("  => done!");
    }
    /** Creates the states DB and sets up listeners for it */
    async createStatesDB() {
        debug(`creating states DB`);
        const statesType = this.statesType;
        debug(`  => states DB type: ${statesType}`);
        const settings = {
            connection: {
                type: statesType,
                host: "127.0.0.1",
                port: 19000,
                options: {
                    auth_pass: null,
                    retry_max_delay: 15000,
                },
            },
            logger: this.logger,
        };
        const statesDbPath = require.resolve(`@iobroker/db-states-${statesType}`, {
            paths: [
                path.join(this.testDir, "node_modules"),
                path.join(this.testControllerDir, "node_modules"),
            ],
        });
        debug(`  => states DB lib found at ${statesDbPath}`);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Server, Client } = require(statesDbPath);
        // First create the server
        await new Promise((resolve) => {
            this._statesServer = new Server({
                ...settings,
                connected: () => {
                    resolve();
                },
            });
        });
        // Then the client
        await new Promise((resolve) => {
            this._statesClient = new Client({
                ...settings,
                connected: () => {
                    this._statesClient.subscribe("*");
                    resolve();
                },
                change: this.emit.bind(this, "stateChange"),
            });
        });
        debug("  => done!");
    }
    subscribeMessage(id) {
        if (!this._statesClient) {
            throw new Error("States DB is not running");
        }
        return this._statesClient.subscribeMessage(id);
    }
    pushMessage(instanceId, msg, callback) {
        if (!this._statesClient) {
            throw new Error("States DB is not running");
        }
        this._statesClient.pushMessage(instanceId, msg, callback);
    }
    async getStateIDs(pattern = "*") {
        var _a, _b, _c, _d;
        if (!this._statesClient) {
            throw new Error("States DB is not running");
        }
        return (((_b = (_a = this._statesClient).getKeysAsync) === null || _b === void 0 ? void 0 : _b.call(_a, pattern)) ||
            ((_d = (_c = this._statesClient).getKeys) === null || _d === void 0 ? void 0 : _d.call(_c, pattern)));
    }
    async getObjectIDs(pattern = "*") {
        var _a, _b, _c, _d;
        if (!this._objectsClient) {
            throw new Error("Objects DB is not running");
        }
        return (((_b = (_a = this._objectsClient).getKeysAsync) === null || _b === void 0 ? void 0 : _b.call(_a, pattern)) ||
            ((_d = (_c = this._objectsClient).getKeys) === null || _d === void 0 ? void 0 : _d.call(_c, pattern)));
    }
}
exports.DBConnection = DBConnection;
