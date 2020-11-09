// Main CLI
import { join } from 'path';
import { parseTscErrors } from 'tsc-errors';
import { partition } from 'utils';

import {
  getLooselyTypeCheckedFilePaths,
  saveJSONFile,
  runTsc,
  getOrangeText,
} from './helpers';

/**
 * The `strict-ts-check` utility helps when migrating to a stricter tsconfig.json configuration
 * incrementally.
 *
 * It does the following:
 * ```md
 * 1. Run `tsc` with a strict tsconfig to get the list of all errors (both valid and those that
 *    should be ignored)
 * 2. Parse the `tsc` errors
 * 3. Ignore the errors for files that should be loosely type-checked
 * 4. Fail if there are real errors in the project
 * 5. Check if there are files in the loosely type-checked list that can be fully type-checked (with
 *    the stricter tsconfig)
 * 6. Fail if there are such files
 *    This allows the script to be run as a guard in CI
 * 7. Optionally, if `--fix` flag is added, update the loosely type-checked files list
 * ```
 */

const looselyTypeCheckedFilesRegistryPath = './loosely-type-checked-files.json';
const strictTsconfigPath = 'tsconfig.json';

/**
 * TypeScript error types that will be ignored in specific allowed files
 *
 * These error codes result from stricter tsconfig.json config (strictNullChecks, noImplicitAny)
 * and can appear in specific allowed files until those files are fixed.
 *
 * If there are new error codes that should be ignored (e.g. because a new stricter TS compiler
 * option was enabled), add them below.
 */
const ignoredErrorCodes = new Set([
  'TS2345',
  'TS2322',
  'TS2722',
  'TS7031',
  'TS7006',
  'TS2532',
  'TS7008',
  'TS2416',
  'TS7034',
  'TS7005',
  'TS2531',
  'TS2571',
  'TS7019',
  'TS2411',
  'TS7010',
  'TS7024',
  'TS2454',
  'TS7051',
  'TS2352',
  'TS2769',
  'TS2698',
  'TS7016',
  'TS2339',
  'TS2538',
]);
const looselyTypeCheckedFilesRegistryFullPath = join(
  __dirname,
  looselyTypeCheckedFilesRegistryPath,
);

const looselyTypeCheckedFilePaths = getLooselyTypeCheckedFilePaths(
  looselyTypeCheckedFilesRegistryFullPath,
);
const autofixEnabled = process.argv.includes('--fix');

console.log(`Running tsc with a strict tsconfig (${strictTsconfigPath})`);

const tscResult = runTsc(strictTsconfigPath);

if (tscResult.status === 0) {
  console.log(
    `\n\nCongratulations! There are no errors using the strict version of ${strictTsconfigPath}.`,
    '\nYou can remove this tool, as well as adjust the main tsconfig.json file to be strict by default.',
  );
  process.exit(0);
}

const tscErrors = parseTscErrors(tscResult.stdout);
processExistingTscErrors();
console.log('\n\n');
processLooselyTypeCheckedFiles();

function processExistingTscErrors() {
  const [ignoredTscErrors, unignoredTscErrors] = partition(
    tscErrors,
    (tscError) => {
      const errorIgnored =
        ignoredErrorCodes.has(tscError.tscErrorCode) &&
        looselyTypeCheckedFilePaths.has(tscError.filePath);

      return errorIgnored;
    },
  );

  console.log(
    `${getOrangeText(
      ignoredTscErrors.length,
    )} TSC errors have been ignored\n\n`,
  );

  if (unignoredTscErrors.length > 0) {
    console.log(
      `There are ${getOrangeText(
        unignoredTscErrors.length,
      )} TSC errors in the loosely type-checked project.`,
    );

    const [
      tscErrorsThatCouldBeIgnored,
      validTscErrors,
    ] = partition(unignoredTscErrors, (tscError) =>
      ignoredErrorCodes.has(tscError.tscErrorCode),
    );

    if (tscErrorsThatCouldBeIgnored.length > 0) {
      const filePathsToStartIgnoring = Array.from(
        new Set(
          tscErrorsThatCouldBeIgnored.map((tscError) => tscError.filePath),
        ),
      );

      if (autofixEnabled) {
        // TODO: add files to registry
        console.log(
          `${getOrangeText(
            tscErrorsThatCouldBeIgnored.length,
          )} TSC errors could be ignored`,
          `\nAdding the following files to ${looselyTypeCheckedFilesRegistryPath}`,
        );
        console.log(filePathsToStartIgnoring);
      } else {
        console.log(
          `${getOrangeText(
            tscErrorsThatCouldBeIgnored.length,
          )} TSC errors could be ignored if the files were specified in ${looselyTypeCheckedFilesRegistryPath}`,
          'They come from the following files:',
        );
        console.log(filePathsToStartIgnoring);
        process.exitCode = 1;
      }
    }

    if (validTscErrors.length > 0) {
      console.log(
        `${getOrangeText(
          validTscErrors.length,
        )} TSC errors could not be ignored.`,
        '\nRun "npm run lint:types" for details.',
        '\nErrors appeared in the following files:',
      );
      console.log(
        Array.from(new Set(unignoredTscErrors.map((error) => error.filePath))),
      );
      process.exitCode = 1;
    }
  }
}

function processLooselyTypeCheckedFiles() {
  const filePathsWithAnyErrors = new Set(
    tscErrors.map((tscError) => tscError.filePath),
  );
  const looselyTypeCheckedFilePathsWithoutErrors = Array.from(
    looselyTypeCheckedFilePaths,
  ).filter((filePath) => !filePathsWithAnyErrors.has(filePath));

  if (looselyTypeCheckedFilePathsWithoutErrors.length === 0) {
    return;
  }

  if (autofixEnabled) {
    console.log(
      'Updating the registry of loosely type-checked file paths. Enabling stricter type checking for the files that have no errors:',
    );
    console.log(looselyTypeCheckedFilePathsWithoutErrors);

    const looselyTypeCheckedFilePathWithErrors = Array.from(
      looselyTypeCheckedFilePaths,
    )
      .filter((filePath) => filePathsWithAnyErrors.has(filePath))
      .sort();

    saveJSONFile(
      looselyTypeCheckedFilesRegistryFullPath,
      looselyTypeCheckedFilePathWithErrors,
    );
    console.log('Registry updated!');
  } else {
    console.log(
      `Consider removing the following files from ${looselyTypeCheckedFilesRegistryPath}, as they do not contain any errors`,
    );
    console.log(looselyTypeCheckedFilePathsWithoutErrors);
    process.exitCode = 1;
  }
}

console.log('\n\n');
