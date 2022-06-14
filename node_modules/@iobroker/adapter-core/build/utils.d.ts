/// <reference types="iobroker" />
/** The root directory of JS-Controller */
export declare const controllerDir: string;
/** Reads the configuration file of JS-Controller */
export declare function getConfig(): Record<string, any>;
/**
 * This type is used to include and exclude the states and objects cache from the adaptert type definition depending on the creation options
 */
export interface AdapterInstance<HasObjectsCache extends boolean | undefined = undefined, HasStatesCache extends boolean | undefined = undefined> extends Omit<ioBroker.Adapter, "oObjects" | "oStates"> {
    oObjects: HasObjectsCache extends true ? Exclude<ioBroker.Adapter["oObjects"], undefined> : undefined;
    oStates: HasStatesCache extends true ? Exclude<ioBroker.Adapter["oStates"], undefined> : undefined;
}
/** This type augments the ioBroker Adapter options to accept two generics for the objects and states cache */
export declare type AdapterOptions<HasObjectsCache extends boolean | undefined = undefined, HasStatesCache extends boolean | undefined = undefined> = Omit<ioBroker.AdapterOptions, "objects" | "states"> & (true extends HasObjectsCache ? {
    objects: true;
} : {
    objects?: HasObjectsCache;
}) & (true extends HasStatesCache ? {
    states: true;
} : {
    states?: HasStatesCache;
});
/** Selects the correct instance type depending on the constructor params */
interface AdapterConstructor {
    new <HasObjectsCache extends boolean | undefined = undefined, HasStatesCache extends boolean | undefined = undefined>(adapterOptions: AdapterOptions<HasObjectsCache, HasStatesCache> | string): AdapterInstance<HasObjectsCache, HasStatesCache>;
    <HasObjectsCache extends boolean | undefined = undefined, HasStatesCache extends boolean | undefined = undefined>(adapterOptions: AdapterOptions<HasObjectsCache, HasStatesCache> | string): AdapterInstance<HasObjectsCache, HasStatesCache>;
}
/** Creates a new adapter instance */
export declare const adapter: AdapterConstructor;
/** Creates a new adapter instance */
export declare const Adapter: AdapterConstructor;
export {};
