# @iobroker/testing

This repo provides utilities for testing of ioBroker adapters and other ioBroker-related modules. It supports:

-   **Unit tests** using mocks (without a running JS-Controller)
-   **Integration tests** that test against a running JS-Controller instance.

The unit tests are realized using the following tools that are provided by this module:

-   A mock database which implements the most basic functionality of `ioBroker`'s Objects and States DB by operating on `Map` objects.
-   A mock `Adapter` that is connected to the mock database. It implements basic functionality of the real `Adapter` class, but only operates on the mock database.

Predefined methods for both unit and integration tests are exported.

## Usage

### Validating package files (package.json, io-package.json, ...)

```ts
const path = require("path");
const { tests } = require("@iobroker/testing");

// Run tests
tests.packageFiles(path.join(__dirname, ".."));
//                 ~~~~~~~~~~~~~~~~~~~~~~~~~
// This should be the adapter's root directory
```

### Adapter startup (Integration test)

Run the following snippet in a `mocha` test file to test the adapter startup process against a real JS-Controller instance:

```ts
const path = require("path");
const { tests } = require("@iobroker/testing");

// Run tests
tests.integration(path.join(__dirname, ".."), {
	//            ~~~~~~~~~~~~~~~~~~~~~~~~~
	// This should be the adapter's root directory

	// If the adapter may call process.exit during startup, define here which exit codes are allowed.
	// By default, termination during startup is not allowed.
	allowedExitCodes: [11],

	// Define your own tests inside defineAdditionalTests
	defineAdditionalTests({ suite }) {
		// All tests (it, describe) must be grouped in one or more suites. Each suite sets up a fresh environment for the adapter tests.
		// At the beginning of each suite, the databases will be reset and the adapter will be started.
		// The adapter will run until the end of each suite.

		// Since the tests are heavily instrumented, each suite gives access to a so called "harness" to control the tests.
		suite("Test sendTo()", (getHarness) => {
			// For convenience, get the current suite's harness before all tests
			let harness;
			before(() => {
				harness = getHarness();
			});

			it("Should work", () => {
				return new Promise(async (resolve) => {
					// Start the adapter and wait until it has started
					await harness.startAdapterAndWait();

					// Perform the actual test:
					harness.sendTo("adapter.0", "test", "message", (resp) => {
						console.dir(resp);
						resolve();
					});
				});
			});
		});
	},
});
```

### Adapter startup (Unit test)

**Unit tests for adapter startup were removed and are essentially a no-op now.**  
If you defined your own tests, they should still work.

```ts
const path = require("path");
const { tests } = require("@iobroker/testing");

tests.unit(path.join(__dirname, ".."), {
	//     ~~~~~~~~~~~~~~~~~~~~~~~~~
	// This should be the adapter's root directory

	// Define your own tests inside defineAdditionalTests.
	// If you need predefined objects etc. here, you need to take care of it yourself
	defineAdditionalTests() {
		it("works", () => {
			// see below how these could look like
		});
	},
});
```

### Helper functions for your own tests

Under `utils`, several functions are exposed to use in your own tests:

```ts
const { utils } = require("@iobroker/testing");
```

Currently, only `utils.unit` is defined which contains tools for unit tests:

#### createMocks()

```ts
const { database, adapter } = utils.unit.createMocks();
// or (with custom adapter options)
const { database, adapter } = utils.unit.createMocks(adapterOptions);
```

This method creates a mock database and a mock adapter. See below for a more detailed description

#### createAsserts()

```ts
const asserts = utils.unit.createAsserts(database, adapter);
```

This methods takes a mock database and adapter and creates a set of asserts for your tests. All IDs may either be a string, which is taken literally, or an array of strings which are concatenated with `"."`. If an ID is not fully qualified, the adapter namespace is prepended automatically.

-   `assertObjectExists(id: string | string[])` asserts that an object with the given ID exists in the database.
-   `assertStateExists(id: string | string[])` asserts that a state with the given ID exists in the database.
-   `assertStateHasValue(id: string | string[], value: any)` asserts that a state has the given value.
-   `assertStateIsAcked(id: string | string[], ack: boolean = true)` asserts that a state is `ack`ed (or not if `ack === false`).
-   `assertStateProperty(id: string | string[], property: string, value: any)` asserts that one of the state's properties (e.g. `from`) has the given value
-   `assertObjectCommon(id: string | string[], common: ioBroker.ObjectCommon)` asserts that an object's common part includes the given `common` object.
-   `assertObjectNative(id: string | string[], native: object)` asserts that an object's native part includes the given `native` object.

#### MockDatabase

TODO

#### MockAdapter

TODO

### Example

Here's an example how this can be used in a unit test:

```ts
import { tests, utils } from "@iobroker/testing";

// Run tests
tests.unit(path.join(__dirname, ".."), {
	//     ~~~~~~~~~~~~~~~~~~~~~~~~~
	// This should be the adapter's root directory

	// Define your own tests inside defineAdditionalTests
	defineAdditionalTests() {
		// Create mocks and asserts
		const { adapter, database } = utils.unit.createMocks();
		const { assertObjectExists } = utils.unit.createAsserts(
			database,
			adapter,
		);

		describe("my test", () => {
			afterEach(() => {
				// The mocks keep track of all method invocations - reset them after each single test
				adapter.resetMockHistory();
				// We want to start each test with a fresh database
				database.clear();
			});

			it("works", () => {
				// Create an object in the fake db we will use in this test
				const theObject: ioBroker.PartialObject = {
					_id: "whatever",
					type: "state",
					common: {
						role: "whatever",
					},
				};
				mocks.database.publishObject(theObject);

				// Do something that should be tested

				// Assert that the object still exists
				assertObjectExists(theObject._id);
			});
		});
	},
});
```
