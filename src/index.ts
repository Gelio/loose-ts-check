import yargs from 'yargs';
import * as chalk from 'chalk';

import {
  parseTscErrors,
  partitionTscErrors,
  validateTscErrorCodes,
} from './tsc-errors';
import {
  aggregateReportingResults,
  CliOptions,
  cliOptionsConfig,
  getCliDependencies,
  getProgramInput,
  getProgramInputAndFail,
  initializeConfigurationFiles,
  readConfig,
  reportLooselyTypeCheckedFilePathsWithoutErrors,
  reportTscErrorsThatCouldBeIgnored,
  reportValidTscErrors,
  updateLooselyTypeCheckedFilePaths,
} from './cli';

const options: CliOptions = yargs(process.argv)
  .options(cliOptionsConfig)
  .parse();
const cliDependencies = getCliDependencies(options);

(() => {
  const readResult = readConfig(cliDependencies);
  if (!readResult) {
    getProgramInputAndFail();
    return;
  }

  const {
    ignoredErrorCodesArray,
    looselyTypeCheckedFilePathsArray,
  } = readResult;

  const ignoredErrorCodes = new Set<string>(ignoredErrorCodesArray);

  const validationErrors = validateTscErrorCodes(ignoredErrorCodes);
  if (validationErrors.length > 0) {
    console.log(`Invalid TSC error codes in ${options['ignored-error-codes']}`);
    validationErrors.forEach(console.log);
    getProgramInputAndFail();
    return;
  }

  const looselyTypeCheckedFilePaths = new Set<string>(
    looselyTypeCheckedFilePathsArray,
  );

  getProgramInput()
    .then((programInput) => {
      const tscErrors = parseTscErrors(programInput);

      if (tscErrors.length === 0) {
        console.log(chalk.green('No TSC errors detected'));
        return;
      }

      console.log(`${chalk.red(tscErrors.length)} errors detected`);

      if (options.init) {
        initializeConfigurationFiles(cliDependencies, tscErrors);
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

      if (unignoredTscErrors.length > 0) {
        console.log(
          `${chalk.red(unignoredTscErrors.length)} errors were not ignored`,
        );
      }

      const updatedLooselyTypeCheckedFilePaths = new Set(
        looselyTypeCheckedFilePaths,
      );

      const reportingResult = aggregateReportingResults([
        reportTscErrorsThatCouldBeIgnored(
          cliDependencies,
          tscErrorsThatCouldBeIgnored,
          updatedLooselyTypeCheckedFilePaths,
        ),
        reportLooselyTypeCheckedFilePathsWithoutErrors(
          cliDependencies,
          updatedLooselyTypeCheckedFilePaths,
          tscErrors,
        ),
        reportValidTscErrors(cliDependencies, validTscErrors),
      ]);

      if (reportingResult?.shouldFail) {
        process.exitCode = 1;
      }

      if (options['auto-update']) {
        updateLooselyTypeCheckedFilePaths(
          cliDependencies,
          looselyTypeCheckedFilePaths,
          updatedLooselyTypeCheckedFilePaths,
        );
      }
    })
    .catch((error) => {
      console.error('Unknown error', error);
    });
})();
