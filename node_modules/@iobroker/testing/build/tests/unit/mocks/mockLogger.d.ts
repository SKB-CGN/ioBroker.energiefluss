/// <reference types="iobroker" />
import { Mock } from "./tools";
export declare type MockLogger = Mock<ioBroker.Logger> & {
    resetMock(): void;
    resetMockHistory(): void;
    resetMockBehavior(): void;
};
/**
 * Creates an adapter mock that is connected to a given database mock
 */
export declare function createLoggerMock(): MockLogger;
