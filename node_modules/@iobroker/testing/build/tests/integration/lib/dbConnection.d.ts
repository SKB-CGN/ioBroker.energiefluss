/// <reference types="iobroker" />
/// <reference types="node" />
import EventEmitter from "events";
export declare type ObjectsDB = Record<string, ioBroker.Object>;
export declare type StatesDB = Record<string, ioBroker.State>;
export interface DBConnection {
    on(event: "objectChange", handler: ioBroker.ObjectChangeHandler): this;
    on(event: "stateChange", handler: ioBroker.StateChangeHandler): this;
}
/** The DB connection capsules access to the states and objects DB */
export declare class DBConnection extends EventEmitter {
    private appName;
    private testDir;
    private logger;
    /**
     * @param appName The branded name of "iobroker"
     * @param testDir The directory the integration tests are executed in
     */
    constructor(appName: string, testDir: string, logger: ioBroker.Logger);
    private testDataDir;
    private testControllerDir;
    private _objectsServer;
    private _statesServer;
    private _objectsClient;
    /** The underlying objects client instance that can be used to access the objects DB */
    get objectsClient(): any;
    private _statesClient;
    /** The underlying states client instance that can be used to access the states DB */
    get statesClient(): any;
    get objectsType(): "file" | "jsonl";
    get objectsPath(): string;
    get statesType(): "file" | "jsonl";
    get statesPath(): string;
    getSystemConfig(): any;
    backup(): Promise<{
        objects: Buffer;
        states: Buffer;
    }>;
    restore(objects: Buffer, states: Buffer): Promise<void>;
    setSystemConfig(systemConfig: any): void;
    private _isRunning;
    get isRunning(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    /** Creates the objects DB and sets up listeners for it */
    private createObjectsDB;
    /** Creates the states DB and sets up listeners for it */
    private createStatesDB;
    readonly getObject: ioBroker.Adapter["getForeignObjectAsync"];
    readonly setObject: ioBroker.Adapter["setForeignObjectAsync"];
    readonly delObject: ioBroker.Adapter["delForeignObjectAsync"];
    readonly getState: ioBroker.Adapter["getForeignStateAsync"];
    readonly setState: ioBroker.Adapter["setForeignStateAsync"];
    readonly delState: ioBroker.Adapter["delForeignStateAsync"];
    subscribeMessage(id: string): void;
    pushMessage(instanceId: string, msg: any, callback: (err: Error | null, id: any) => void): void;
    readonly getObjectViewAsync: ioBroker.Adapter["getObjectViewAsync"];
    getStateIDs(pattern?: string): Promise<string[]>;
    getObjectIDs(pattern?: string): Promise<string[]>;
}
