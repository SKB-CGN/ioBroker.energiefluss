import type { DBConnection } from "./dbConnection";
export declare class AdapterSetup {
    private adapterDir;
    private testDir;
    constructor(adapterDir: string, testDir: string);
    private testAdapterDir;
    private adapterName;
    private adapterFullName;
    private appName;
    private testControllerDir;
    /**
     * Tests if the adapter is already installed in the test directory
     */
    isAdapterInstalled(): Promise<boolean>;
    /** Copies all adapter files (except a few) to the test directory */
    installAdapterInTestDir(): Promise<void>;
    /**
     * Adds an instance for an already installed adapter in the test directory
     */
    addAdapterInstance(): Promise<void>;
    deleteOldInstances(dbConnection: DBConnection): Promise<void>;
}
