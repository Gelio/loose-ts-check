# Loose TS check

[![Downloads badge](https://img.shields.io/npm/dw/loose-ts-check.svg?style=flat)](https://www.npmjs.com/package/loose-ts-check)
[![Version badge](https://img.shields.io/npm/v/loose-ts-check.svg?style=flat)](https://www.npmjs.com/package/loose-ts-check)
[![License badge](https://img.shields.io/npm/l/loose-ts-check.svg?style=flat)](https://github.com/Gelio/loose-ts-check/blob/master/LICENSE.md)
[![GitHub stars badge](https://img.shields.io/github/stars/Gelio/loose-ts-check.svg?style=social)](https://github.com/Gelio/loose-ts-check)
![CI](https://github.com/Gelio/loose-ts-check/workflows/CI/badge.svg)

The `loose-ts-check` utility helps ignore particular types of TS error in specified files.

This is useful when migrating to a stricter `tsconfig.json` configuration incrementally, where only
some existing files are allowed to have TS errors.

## Features

- ignores specific TS errors from specific files
- detects files that no longer have to be loosely type-checked
- auto-updates the loosely type-checked list of files when a file no longer has error
- auto-updates the ignored error codes when there are no errors of that type

## Why not `exclude` in `tsconfig.json`

The `exclude` option in `tsconfig.json` only tells tsc to not start type-checking from those files.
If some already type-checked file imports a file listed in the `exclude`, it will still be
type-checked.

Thus, it does not suit this use case.

## Why not follow the idea from the VSCode project

[The vscode team have already encountered a similar problem](https://code.visualstudio.com/blogs/2019/05/23/strict-null#_coming-up-with-an-incremental-plan)
and solved it in another way. They created a new `tsconfig.json` that only included some files.

While this works great with existing files, it does not automatically enforce a stricter config for
new files in the project.

## Installation

Install the utility with:

```sh
npm install loose-ts-check --save-dev
```

## Usage

Pipe the result of `tsc` to `loose-ts-check` to run the utility:

```sh
tsc --noEmit -p tsconfig.strict.json | npx loose-ts-check
```

To initialize the list of ignored errors and loosely type-checked files based on the current errors,
run:

```sh
tsc --noEmit -p tsconfig.strict.json | npx loose-ts-check --init
```

To automatically update the list of loosely type-checked files, run:

```sh
tsc --noEmit -p tsconfig.strict.json | npx loose-ts-check --auto-update
```

### Options

Display the list of options by running:

```sh
npx loose-ts-check --help
```

## Recipes

### Reusing the same tsc output

To avoid running `tsc` again and again when testing, save the output to a file:

```ts
tsc > errors.log;
```

And then, use the tool by redirecting the input:

```sh
npx loose-ts-check < errors.log
```

### Migrating to a stricter tsconfig.json

To migrate the codebase to use a stricter `tsconfig.json`, you will need 2 tsconfigs:

1. `tsconfig.json` - the strict tsconfig. This config will be used by the IDE and by the
   `loose-ts-check` tool.

   The aim is to see the errors in the IDE, to feel motivated to fix the errors while modifying
   existing files.

2. `tsconfig.loose.json` - a tsconfig that extends `tsconfig.json`, but has the stricter options
   turned off.

   This config will be used by any linter, test runner, bundler you will have.

   If you are using `ts-node`, you need to pass `tsconfig.loose.json` as a `TS_NODE_PROJECT`
   variable, so it uses the correct tsconfig, e.g.

   ```sh
   cross-env TS_NODE_PROJECT="tsconfig.loose.json" webpack --mode=development
   ```

   To run `tsc` to do type-checking, pass `-p tsconfig.loose.json` option:

   ```sh
   tsc -p tsconfig.loose.json
   ```

Then, use the following command to initialize the config files:

```sh
tsc | npx loose-ts-check --init
```

After that, run

```sh
tsc | npx loose-ts-check
```

instead of `tsc` to do type-checking.
