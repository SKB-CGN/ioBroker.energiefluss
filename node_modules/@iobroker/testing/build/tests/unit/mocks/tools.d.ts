/// <reference types="sinon" />
import type { Equals, Overwrite } from "alcalzone-shared/types";
export declare type IsAny<T> = Equals<T extends never ? false : true, boolean>;
export declare type MockableMethods<T, All = Required<T>, NoAny = {
    [K in keyof All]: IsAny<All[K]> extends true ? never : All[K] extends (...args: any[]) => void ? K : never;
}> = NoAny[keyof NoAny];
export declare type Mock<T> = Overwrite<T, {
    [K in MockableMethods<T>]: sinon.SinonStub;
}>;
export declare function doResetHistory(parent: Record<string, any>): void;
export declare function doResetBehavior(parent: Record<string, any>, implementedMethods: Record<string, any>): void;
export declare function stubAndPromisifyImplementedMethods<T extends string>(parent: Record<T, any>, implementedMethods: Partial<Record<T, any>>, allowUserOverrides?: T[]): void;
export declare type ImplementedMethodDictionary<T> = Partial<Record<MockableMethods<T>, "none" | "normal" | "no error">>;
