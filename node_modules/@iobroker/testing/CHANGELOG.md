## Changelog

<!--
	PLACEHOLDER for next version:
	## __WORK IN PROGRESS__
-->
## 3.0.2 (2022-05-15)
* Fix: Replace the `harness` argument to the `suite()` function with a `getHarness()` function to avoid accessing a stale harness.

## 3.0.1 (2022-05-09)
* BREAKING: The function signature of `defineAdditionalTests` in integration tests has changed. All user-defined integration tests must now be grouped in one or more `suite` blocks. The adapter will now only be started at the beginning of each suite. See the documentation for details.
* BREAKING: The function signature of `harness.startAdapterAndWait` has changed. It now accepts a boolean as the first parameter which controls whether to wait for the `alive` state (`false`) or the `info.connection` state (`true`).

## 2.6.0 (2022-04-18)
* The loglevel for the adapter and DB instances is now configurable and defaults to `"debug"` in both cases

## 2.5.6 (2022-03-05)
* Allow immediate exit with code `0` for `once` and `subscribe` adapters too

## 2.5.5 (2022-03-04)
* Allow immediate exit with code `0` for `schedule` adapters
* Check that `npm` is not listed as a local dependency in `package.json`
* Updated dependencies

## 2.5.4 (2022-02-02)
* Modifying ioBroker databases now uses the same methods that JS-Controller uses internally. This ensures that the testing is compatible with the `jsonl` database format.
* Testing adapters with adapter dependencies that try to access the databases during installation now works.

## 2.5.2 (2021-09-18)
* Fix: `adminUI.config` is now respected for the config UI check and JSON config is allowed too
* Updated dependencies
* Modernized build process

## 2.5.1 (2021-09-05)
* We now use the nightly js-controller dev builds instead of GitHub installation

## 2.4.4 (2021-03-14)
* Fix error: `iopackContent.common.titleLang` is not iterable

## 2.4.3 (2021-03-12)
* Fix: The adapter main file now correctly gets located when it is only defined in `package.json`, not `io-package.json`

## 2.4.2 (2021-01-06)
* Fixed compatibility with the reworked database classes
* Improved shutdown behavior of the adapter

## 2.4.1 (2021-01-01)
* Fixed a bug where the wrong `js-controller` dependency would be installed

## 2.4.0 (2020-12-07)
* Unit tests for adapter startup were removed and only log a warning that you can remove them
* Upgrade many packages

## 2.3.0 (2020-08-20)
* Added missing async functions to adapter mock
* Fixed: `TypeError "Cannot redefine property readyHandler"` when using `createMocks` more than once
* Upgrade to `@types/iobroker` v3.0.12

## 2.2.0 (2020-04-15)
* Upgrade to `@types/iobroker` v3.0.2
* Added mocks for `supportsFeature`, `getPluginInstance`, `getPluginConfig`

## 2.1.0 (2020-03-01)
* **Integration tests:** For Node.js >= 10, the `engine-strict` flag is now set to `true` to be in line with newer ioBroker installations

## v2.0.2
* **Unit tests:** added mocks for `getAbsoluteDefaultDataDir` and `getAbsoluteInstanceDataDir`

Sorry, there isn't more yet.
