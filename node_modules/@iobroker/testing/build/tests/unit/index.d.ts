export interface TestAdapterOptions {
    /** Allows you to define additional tests */
    defineAdditionalTests?: () => void;
}
/**
 * @deprecated
 * Tests the adapter startup in offline mode (with mocks, no JS-Controller)
 * This is meant to be executed in a mocha context.
 */
export declare function testAdapterWithMocks(_adapterDir: string, options?: TestAdapterOptions): void;
