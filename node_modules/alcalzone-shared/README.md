# shared-utils

[![node](https://img.shields.io/node/v/alcalzone-shared.svg) ![npm](https://img.shields.io/npm/v/alcalzone-shared.svg)](https://www.npmjs.com/package/alcalzone-shared)

[![Build Status](https://img.shields.io/circleci/project/github/AlCalzone/shared-utils.svg)](https://circleci.com/gh/AlCalzone/shared-utils)
[![Coverage Status](https://img.shields.io/coveralls/github/AlCalzone/shared-utils.svg)](https://coveralls.io/github/AlCalzone/shared-utils)

A set of utilities shared between my projects

Function documentation available [here](https://alcalzone.github.io/shared-utils/)

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### __WORK IN PROGRESS__
-->
### 4.0.1 (2021-11-15)
`SortedQueue`: Fixed an issue where inserting an item before the first one would cause the queue to lose track of items

### 4.0.0 (2021-06-19)
* Node.js 12+ is now required

### 3.0.4 (2021-04-24)
* Fix compatibility of `wait()` with Electron if `unref` is `true`
* Dependency updates

### 3.0.3 (2021-03-09)
#### Fixes
* Fixed compatibility with TypeScript 4.2

### 3.0.2 (2021-01-16)
#### Fixes
* The argument to `resolve` of `DeferredPromise` is no longer optional, except for `Promise<void>`

### 3.0.1 (2020-12-05)
#### Fixes
* The typeguard `isObject` no longer narrows the type of the argument to `object`

### 3.0.0 (2020-08-16)
#### Breaking changes
* Renamed the following types:
  * `DropLast` -> `Lead`
  * `TakeLast` -> `Last`
  * `TakeLastArgument` -> `LastArgument`
* TypeScript 4.1 is now required

#### Features
* Added the following types:
  * `FixedIndizesOf<T[]>` - Like `IndizesOf`, but does not include the type `number` if the tuple/array is variable-length
  * `Tail<T[]>` - Returns all but the first item's type in a tuple/array
  * `Push<List[], Item>` - Returns the given tuple/array with the item type appended to it
  * `Concat<T1[], T2[]>` - Concatenates the given tuples/arrays
  * `TupleOf<T, N>` - Returns a tuple of length `N` with item types `T`.
  * `Range<N>` - Creates a Union of all numbers (converted to string) from 0 to N (exclusive), e.g. `Range<4>` is equal to `"0" | "1" | "2" | "3"`.
  * `RangeFrom<N, M>` - Creates a Union of all numbers from N (inclusive) to M (exclusive), e.g. `RangeFrom<2, 4>` is equal to `"2" | "3"`.
  * `IsGreaterThan<N, M>` - is equal to `true` if `N > M`, otherwise `false`
  * `IsLessThanOrEqual<N, M>` - is equal to `true` if `N <= M`, otherwise `false`
  * `IsLessThan<N, M>` - is equal to `true` if `N < M`, otherwise `false`
  * `IsGreaterThanOrEqual<N, M>` - is equal to `true` if `N >= M`, otherwise `false`

#### Fixes
* The type `CallbackAPIReturnType` now works with `strictNullChecks`.
* The type `Promisify` is no longer experimental and no longer messes up the inferred signature argument names

### 2.3.0 (2020-06-08)
* Added optional `unref` parameter to `async` -> `wait(ms, [unref])`