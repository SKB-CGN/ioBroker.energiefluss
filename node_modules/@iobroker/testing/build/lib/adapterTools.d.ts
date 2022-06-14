/// <reference types="iobroker" />
/**
 * Loads an adapter's package.json
 * @param adapterDir The directory the adapter resides in
 */
export declare function loadNpmPackage(adapterDir: string): Record<string, any>;
/**
 * Loads an adapter's io-package.json
 * @param adapterDir The directory the adapter resides in
 */
export declare function loadIoPackage(adapterDir: string): Record<string, any>;
export declare function getAdapterExecutionMode(adapterDir: string): ioBroker.AdapterCommon["mode"];
/**
 * Locates an adapter's main file
 * @param adapterDir The directory the adapter resides in
 */
export declare function locateAdapterMainFile(adapterDir: string): Promise<string>;
/**
 * Locates an adapter's config to populate the `adapter.config` object with
 * @param adapterDir The directory the adapter resides in
 */
export declare function loadAdapterConfig(adapterDir: string): Record<string, any>;
/**
 * Loads the adapter's common configuration from `io-package.json`
 * @param adapterDir The directory the adapter resides in
 */
export declare function loadAdapterCommon(adapterDir: string): Record<string, any>;
/**
 * Loads the instanceObjects for an adapter from its `io-package.json`
 * @param adapterDir The directory the adapter resides in
 */
export declare function loadInstanceObjects(adapterDir: string): ioBroker.Object[];
/** Returns the branded name of "iobroker" */
export declare function getAppName(adapterDir: string): string;
/** Returns the name of an adapter without the prefix */
export declare function getAdapterName(adapterDir: string): string;
/** Returns the full name of an adapter, including the prefix */
export declare function getAdapterFullName(adapterDir: string): string;
/** Reads other ioBroker modules this adapter depends on from io-package.json */
export declare function getAdapterDependencies(adapterDir: string): Record<string, string>;
