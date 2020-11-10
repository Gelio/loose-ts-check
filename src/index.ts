import yargs from 'yargs';
import * as chalk from 'chalk';

import {
  parseTscErrors,
  partitionTscErrors,
  TscError,
  validateTscErrorCodes,
} from './tsc-errors';
import { saveJSONArray, readJSONArray, getProgramInput } from './helpers';

const options = yargs(process.argv)
  .options({
    'ignored-error-codes': {
      type: 'string',
      description:
        'Path to a JSON file with an array of TSC error codes that should be ignored',
      default: 'ignored-error-codes.json',
      normalize: true,
    },
    'loosely-type-checked-files': {
      type: 'string',
      description:
        'Path to a JSON file with an array of file paths that should be loosely checked.' +
        '\nSpecified errors will be ignored in those files.',
      default: 'loosely-type-checked-files.json',
      normalize: true,
    },
    init: {
      alias: ['i'],
      type: 'boolean',
      description: 'Initialize the JSON files with existing TSC errors',
      default: false,
    },
    'auto-update': {
      type: 'boolean',
      description:
        'When specified, the files that no longer have errors will be removed from the list of loosely type-checked files',
      default: false,
    },
  })
  .parse();

const ignoredErrorCodesArray = readJSONArray(
  options['ignored-error-codes'],
  options.init,
);
const looselyTypeCheckedFilePathsArray = readJSONArray(
  options['loosely-type-checked-files'],
  options.init,
);

if (
  !Array.isArray(ignoredErrorCodesArray) ||
  !Array.isArray(looselyTypeCheckedFilePathsArray)
) {
  if (ignoredErrorCodesArray instanceof Error) {
    console.log(ignoredErrorCodesArray.message);
  }
  if (looselyTypeCheckedFilePathsArray instanceof Error) {
    console.log(looselyTypeCheckedFilePathsArray.message);
  }

  console.log(chalk.yellow('Either fix the files or pass the --init option'));
  process.exit(1);
}

const ignoredErrorCodes = new Set(ignoredErrorCodesArray);

const validationErrors = validateTscErrorCodes(ignoredErrorCodes);
if (validationErrors.length > 0) {
  console.log(`Invalid TSC error codes in ${options['ignored-error-codes']}`);
  validationErrors.forEach(console.log);
  process.exit(1);
}

const looselyTypeCheckedFilePaths = new Set(looselyTypeCheckedFilePathsArray);

getProgramInput()
  .then((programInput) => {
    const tscErrors = parseTscErrors(programInput);

    if (tscErrors.length === 0) {
      console.log(chalk.green('No TSC errors detected'));
      return;
    }

    console.log(`${chalk.red(tscErrors.length)} errors detected`);

    const filePathsWithErrors = new Set(
      tscErrors.map((tscError) => tscError.filePath),
    );

    if (options.init) {
      initializeConfigurationFiles(filePathsWithErrors, tscErrors);
      process.exit(0);
    }

    const {
      ignoredTscErrors,
      unignoredTscErrors,
      tscErrorsThatCouldBeIgnored,
      validTscErrors,
    } = partitionTscErrors({
      tscErrors,
      ignoredErrorCodes,
      looselyTypeCheckedFilePaths,
    });

    console.log(
      `${chalk.yellow(ignoredTscErrors.length)} errors have been ignored`,
    );

    if (unignoredTscErrors.length === 0) {
      process.exit(0);
    }

    console.log(
      `${chalk.red(unignoredTscErrors.length)} errors were not ignored`,
    );

    let updateFileRegistryPossible = false;

    updateFileRegistryPossible = reportTscErrorsThatCouldBeIgnored(
      tscErrorsThatCouldBeIgnored,
      updateFileRegistryPossible,
    );

    const looselyTypeCheckedFilePathsWithoutErrors = Array.from(
      looselyTypeCheckedFilePaths,
    ).filter((filePath) => !filePathsWithErrors.has(filePath));

    updateFileRegistryPossible = reportLooselyTypeCheckedFilePathsWithoutErrors(
      looselyTypeCheckedFilePathsWithoutErrors,
      updateFileRegistryPossible,
    );

    reportValidTscErrors(validTscErrors);

    if (options['auto-update'] && updateFileRegistryPossible) {
      updateLooselyTypeCheckedFilePaths(
        looselyTypeCheckedFilePathsWithoutErrors,
        tscErrorsThatCouldBeIgnored,
      );
    }
  })
  .catch((error) => {
    console.error('Unknown error', error);
  });

function updateLooselyTypeCheckedFilePaths(
  looselyTypeCheckedFilePathsWithoutErrors: any[],
  tscErrorsThatCouldBeIgnored: TscError[],
) {
  console.log('Updating the list of loosely type-checked files...');

  const updatedLooselyTypeCheckedFiles = new Set(looselyTypeCheckedFilePaths);
  looselyTypeCheckedFilePathsWithoutErrors.forEach((filePath) =>
    updatedLooselyTypeCheckedFiles.delete(filePath),
  );
  tscErrorsThatCouldBeIgnored.forEach((tscError) =>
    updatedLooselyTypeCheckedFiles.add(tscError.filePath),
  );

  saveJSONArray(
    options['loosely-type-checked-files'],
    Array.from(updatedLooselyTypeCheckedFiles),
  );
  console.log('The list of loosely type-checked files updated successfully');
}

function reportValidTscErrors(validTscErrors: TscError[]) {
  if (validTscErrors.length > 0) {
    console.log(
      `${chalk.red(validTscErrors.length)} errors could not be ignored`,
    );

    validTscErrors.forEach((error) =>
      console.log(error.rawErrorLines.join('\n')),
    );
    process.exitCode = 1;
  }
}

function reportLooselyTypeCheckedFilePathsWithoutErrors(
  looselyTypeCheckedFilePathsWithoutErrors: any[],
  updateFileRegistryPossible: boolean,
) {
  if (looselyTypeCheckedFilePathsWithoutErrors.length > 0) {
    console.log(
      `${chalk.yellow(
        looselyTypeCheckedFilePathsWithoutErrors.length,
      )} loosely type-checked files no longer have any errors and could be strictly type-checked.`,
    );
    updateFileRegistryPossible = true;

    if (!options['auto-update']) {
      console.log(
        `Use the ${chalk.green(
          '--auto-update',
        )} option to update the registry automatically.`,
      );
      process.exitCode = 1;
    }
  }
  return updateFileRegistryPossible;
}

function reportTscErrorsThatCouldBeIgnored(
  tscErrorsThatCouldBeIgnored: TscError[],
  updateFileRegistryPossible: boolean,
) {
  if (tscErrorsThatCouldBeIgnored.length > 0) {
    console.log(
      `${chalk.yellow(
        tscErrorsThatCouldBeIgnored.length,
      )} errors could be ignored, as their error codes should be ignored`,
    );
    updateFileRegistryPossible = true;

    if (!options['auto-update']) {
      console.log(
        `Use the ${chalk.green(
          '--auto-update',
        )} option to update the registry automatically.`,
      );
      process.exitCode = 1;
    }
  }

  return updateFileRegistryPossible;
}

function initializeConfigurationFiles(
  filePathsWithErrors: Set<string>,
  tscErrors: TscError[],
) {
  console.log('Initializing configuration files...');

  saveJSONArray(
    options['loosely-type-checked-files'],
    Array.from(filePathsWithErrors),
  );
  saveJSONArray(
    options['ignored-error-codes'],
    Array.from(new Set(tscErrors.map((tscError) => tscError.tscErrorCode))),
  );

  console.log('Configuration files saved successfully');
}
