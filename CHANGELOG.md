# Changelog

## Unreleased

## v1.3.0 (2023-01-08)

Features:

- Wildcard support in `loosely-type-checked-files.json`

  Paths in `loosely-type-checked-files.json` support wildcards now (e.g.
  `src/**/*` or `node_modules/**/*` or `src/{a,b,c}/*.ts`).

  Matching is done using [minimatch](https://www.npmjs.com/package/minimatch).

Engineering:

- Maintenance work (update npm packages, use newer Node versions in CI).
- Add integration tests

  They give more confidence that the tool is working as expected.

## v1.2.0 (2020-11-19)

Features:

1. Display a list of all errors that cannot be ignored.

## v1.1.0 (2020-11-11)

Features:

1. Detect which ignored error codes specified in the config that did not occur.

   If `--auto-update` is passed in, those error codes are automatically removed
   from the config.

Engineering:

1. Refactor the code for easier maintenance
2. Add unit tests for the CLI and individual functions

## v1.0.1 (2020-11-10)

Bugfix release

1. Wait till the input ends before closing the input stream.

   This prevents displaying errors when piping output from a long-running TSC
   process when the `loose-ts-check` tool quits early due a config error.

## v1.0.0 (2020-11-10)

Initial release of the tool.

Features:

1. Parse TSC errors from standard input (stdin)
2. `--init` CLI option to initialize the configuration files (ignored errors and
   loosely type-checked files)
3. CLI options to customize the paths to configuration files
4. `--auto-update` CLI option to automatically update the list of loosely
   type-checked files when some file from no longer needs errors to be ignored

Engineering:

1. Some unit tests using jest
2. CI using GitHub Actions
3. Compilation using TypeScript
4. Formatting using prettier
