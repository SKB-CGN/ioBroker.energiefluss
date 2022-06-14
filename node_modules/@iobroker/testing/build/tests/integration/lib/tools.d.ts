/**
 * Locates the directory where JS-Controller is installed for integration tests
 * @param appName The branded name of "iobroker"
 * @param testDir The directory the integration tests are executed in
 */
export declare function getTestControllerDir(appName: string, testDir: string): string;
/**
 * Locates the directory where JS-Controller stores its data for integration tests
 * @param appName The branded name of "iobroker"
 * @param testDir The directory the integration tests are executed in
 */
export declare function getTestDataDir(appName: string, testDir: string): string;
/**
 * Locates the directory where JS-Controller stores its logs for integration tests
 * @param appName The branded name of "iobroker"
 * @param testDir The directory the integration tests are executed in
 */
export declare function getTestLogDir(appName: string, testDir: string): string;
/**
 * Locates the directory where JS-Controller stores its sqlite db during integration tests
 * @param appName The branded name of "iobroker"
 * @param testDir The directory the integration tests are executed in
 */
export declare function getTestDBDir(appName: string, testDir: string): string;
/**
 * Locates the directory where the adapter will be be stored for integration tests
 * @param adapterDir The root directory of the adapter
 * @param testDir The directory the integration tests are executed in
 */
export declare function getTestAdapterDir(adapterDir: string, testDir: string): string;
