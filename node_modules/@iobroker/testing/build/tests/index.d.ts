import { testAdapter } from "./integration";
import { validatePackageFiles } from "./packageFiles";
import { testAdapterWithMocks } from "./unit";
import { createMocks } from "./unit/harness/createMocks";
import { createAsserts } from "./unit/mocks/mockDatabase";
export { TestHarness as IntegrationTestHarness } from "./integration/lib/harness";
export { MockAdapter } from "./unit/mocks/mockAdapter";
export { MockDatabase } from "./unit/mocks/mockDatabase";
/** Predefined test sets */
export declare const tests: {
    /** @deprecated Adapter startup unit tests are no longer supported */
    unit: typeof testAdapterWithMocks;
    integration: typeof testAdapter;
    packageFiles: typeof validatePackageFiles;
};
/** Utilities for your own tests */
export declare const utils: {
    unit: {
        createMocks: typeof createMocks;
        createAsserts: typeof createAsserts;
        /** @deprecated Adapter startup unit tests are no longer supported */
        startMockAdapter: () => {};
    };
};
