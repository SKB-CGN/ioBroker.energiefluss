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
exports.ControllerSetup = void 0;
// Add debug logging for tests
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = require("fs-extra");
const net_1 = require("net");
const path = __importStar(require("path"));
const adapterTools_1 = require("../../../lib/adapterTools");
const executeCommand_1 = require("../../../lib/executeCommand");
const tools_1 = require("./tools");
const debug = (0, debug_1.default)("testing:integration:ControllerSetup");
class ControllerSetup {
    constructor(adapterDir, testDir) {
        this.adapterDir = adapterDir;
        this.testDir = testDir;
        debug("Creating ControllerSetup...");
        this.adapterName = (0, adapterTools_1.getAdapterName)(this.adapterDir);
        this.appName = (0, adapterTools_1.getAppName)(this.adapterDir);
        this.testAdapterDir = (0, tools_1.getTestAdapterDir)(this.adapterDir, this.testDir);
        this.testControllerDir = (0, tools_1.getTestControllerDir)(this.appName, this.testDir);
        this.testDataDir = (0, tools_1.getTestDataDir)(this.appName, this.testDir);
        debug(`  directories:`);
        debug(`    controller: ${this.testControllerDir}`);
        debug(`    adapter:    ${this.testAdapterDir}`);
        debug(`    data:       ${this.testDataDir}`);
        debug(`  appName:      ${this.appName}`);
        debug(`  adapterName:  ${this.adapterName}`);
    }
    async prepareTestDir() {
        debug("Preparing the test directory...");
        // Make sure the test dir exists
        await (0, fs_extra_1.ensureDir)(this.testDir);
        // Write the package.json
        const packageJson = {
            name: path.basename(this.testDir),
            version: "1.0.0",
            main: "index.js",
            scripts: {
                test: 'echo "Error: no test specified" && exit 1',
            },
            keywords: [],
            author: "",
            license: "ISC",
            dependencies: {
                [`${this.appName}.js-controller`]: "dev",
            },
            description: "",
        };
        await (0, fs_extra_1.writeJSON)(path.join(this.testDir, "package.json"), packageJson, {
            spaces: 2,
        });
        // Delete a possible package-lock.json as it can mess with future installations
        const pckLockPath = path.join(this.testDir, "package-lock.json");
        if (await (0, fs_extra_1.pathExists)(pckLockPath))
            await (0, fs_extra_1.unlink)(pckLockPath);
        // Set the engineStrict flag on new Node.js versions to be in line with newer ioBroker installations
        const nodeMajorVersion = parseInt(process.versions.node.split(".")[0], 10);
        if (nodeMajorVersion >= 10) {
            await (0, fs_extra_1.writeFile)(path.join(this.testDir, ".npmrc"), "engine-strict=true", "utf8");
        }
        // Remember if JS-Controller is installed already. If so, we need to call `setup first` afterwards
        const wasJsControllerInstalled = await this.isJsControllerInstalled();
        // Defer to npm to install the controller (if it wasn't already)
        debug("(Re-)installing JS Controller...");
        await (0, executeCommand_1.executeCommand)("npm", ["i", "--production"], {
            cwd: this.testDir,
        });
        // Prepare/clean the databases and config
        if (wasJsControllerInstalled)
            await this.setupJsController();
        debug("  => done!");
    }
    /**
     * Tests if JS-Controller is already installed
     * @param appName The branded name of "iobroker"
     * @param testDir The directory the integration tests are executed in
     */
    async isJsControllerInstalled() {
        debug("Testing if JS-Controller is installed...");
        // We expect js-controller to be installed if the dir in <testDir>/node_modules and the data directory exist
        const isInstalled = (await (0, fs_extra_1.pathExists)(this.testControllerDir)) &&
            (await (0, fs_extra_1.pathExists)(this.testDataDir));
        debug(`  => ${isInstalled}`);
        return isInstalled;
    }
    /**
     * Tests if an instance of JS-Controller is already running by attempting to connect to the Objects DB
     */
    isJsControllerRunning() {
        debug("Testing if JS-Controller is running...");
        return new Promise((resolve) => {
            const client = new net_1.Socket();
            // Try to connect to an existing ObjectsDB
            client
                .connect({
                port: 9000,
                host: "127.0.0.1",
            })
                .on("connect", () => {
                // The connection succeeded
                client.destroy();
                debug(`  => true`);
                resolve(true);
            })
                .on("error", () => {
                client.destroy();
                debug(`  => false`);
                resolve(false);
            });
            setTimeout(() => {
                // Assume the connection failed after 1 s
                client.destroy();
                debug(`  => false`);
                resolve(false);
            }, 1000);
        });
    }
    // /**
    //  * Installs a new instance of JS-Controller into the test directory
    //  * @param appName The branded name of "iobroker"
    //  * @param testDir The directory the integration tests are executed in
    //  */
    // public async installJsController(): Promise<void> {
    // 	debug("Installing newest JS-Controller from github...");
    // 	// First npm install the JS-Controller into the correct directory
    // 	const installUrl = `${this.appName}/${this.appName}.js-controller`;
    // 	const installResult = await executeCommand(
    // 		"npm",
    // 		["i", installUrl, "--save"],
    // 		{
    // 			cwd: this.testDir,
    // 		},
    // 	);
    // 	if (installResult.exitCode !== 0)
    // 		throw new Error("JS-Controller could not be installed!");
    // 	debug("  => done!");
    // }
    /**
     * Sets up an existing JS-Controller instance for testing by executing "iobroker setup first"
     */
    async setupJsController() {
        debug("Initializing JS-Controller installation...");
        // Stop the controller before calling setup first
        await (0, executeCommand_1.executeCommand)("node", [`${this.appName}.js`, "stop"], {
            cwd: this.testControllerDir,
            stdout: "ignore",
        });
        const setupResult = await (0, executeCommand_1.executeCommand)("node", [`${this.appName}.js`, "setup", "first", "--console"], {
            cwd: this.testControllerDir,
            stdout: "ignore",
        });
        if (setupResult.exitCode !== 0)
            throw new Error(`${this.appName} setup first failed!`);
        debug("  => done!");
    }
    /**
     * Changes the objects and states db to use alternative ports
     * @param appName The branded name of "iobroker"
     * @param testDir The directory the integration tests are executed in
     */
    setupSystemConfig(dbConnection) {
        debug(`Moving databases to different ports...`);
        const systemConfig = dbConnection.getSystemConfig();
        systemConfig.objects.port = 19001;
        systemConfig.states.port = 19000;
        dbConnection.setSystemConfig(systemConfig);
        debug("  => done!");
    }
    /**
     * Clears the log dir for integration tests (and creates it if it doesn't exist)
     * @param appName The branded name of "iobroker"
     * @param testDir The directory the integration tests are executed in
     */
    clearLogDir() {
        debug("Cleaning log directory...");
        return (0, fs_extra_1.emptyDir)((0, tools_1.getTestLogDir)(this.appName, this.testDir));
    }
    /**
     * Clears the sqlite DB dir for integration tests (and creates it if it doesn't exist)
     * @param appName The branded name of "iobroker"
     * @param testDir The directory the integration tests are executed in
     */
    clearDBDir() {
        debug("Cleaning SQLite directory...");
        return (0, fs_extra_1.emptyDir)((0, tools_1.getTestDBDir)(this.appName, this.testDir));
    }
    /**
     * Disables all admin instances in the objects DB
     * @param objects The contents of objects.json
     */
    async disableAdminInstances(dbConnection) {
        debug("Disabling admin instances...");
        const instanceObjects = await dbConnection.getObjectViewAsync("system", "instance", {
            startkey: "system.adapter.admin.",
            endkey: "system.adapter.admin.\u9999",
        });
        for (const { id, value: obj } of instanceObjects.rows) {
            if (obj && obj.common) {
                obj.common.enabled = false;
                await dbConnection.setObject(id, obj);
            }
        }
        debug("  => done!");
    }
}
exports.ControllerSetup = ControllerSetup;
