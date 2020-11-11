import * as chalk from 'chalk';

import {
  parseTscErrors,
  partitionTscErrors,
  validateTscErrorCodes,
} from '../tsc-errors';
import { CliDependencies } from './cli-dependencies';
import {
  initializeConfigurationFiles,
  readConfig,
  updateLooselyTypeCheckedFilePaths,
} from './config';
import {
  aggregateReportingResults,
  reportLooselyTypeCheckedFilePathsWithoutErrors,
  reportTscErrorsThatCouldBeIgnored,
  reportValidTscErrors,
} from './reporting';

export const program = (
  cliDependencies: CliDependencies,
  programInput: string[],
): { error: true } | undefined => {
  const readResult = readConfig(cliDependencies);
  if (!readResult) {
    return { error: true };
  }

  const {
    ignoredErrorCodesArray,
    looselyTypeCheckedFilePathsArray,
  } = readResult;

  const ignoredErrorCodes = new Set<string>(ignoredErrorCodesArray);

  const validationErrors = validateTscErrorCodes(ignoredErrorCodes);
  if (validationErrors.length > 0) {
    cliDependencies.log(
      `Invalid TSC error codes in ${cliDependencies.cliOptions['ignored-error-codes']}`,
    );
    validationErrors.forEach(cliDependencies.log);

    return { error: true };
  }

  const looselyTypeCheckedFilePaths = new Set<string>(
    looselyTypeCheckedFilePathsArray,
  );

  const tscErrors = parseTscErrors(programInput);

  if (tscErrors.length === 0) {
    cliDependencies.log(chalk.green('No TSC errors detected'));
    return;
  }

  cliDependencies.log(`${chalk.red(tscErrors.length)} errors detected`);

  if (cliDependencies.cliOptions.init) {
    initializeConfigurationFiles(cliDependencies, tscErrors);
    return;
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

  cliDependencies.log(
    `${chalk.yellow(ignoredTscErrors.length)} errors have been ignored`,
  );

  if (unignoredTscErrors.length > 0) {
    cliDependencies.log(
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

  if (cliDependencies.cliOptions['auto-update']) {
    updateLooselyTypeCheckedFilePaths(
      cliDependencies,
      looselyTypeCheckedFilePaths,
      updatedLooselyTypeCheckedFilePaths,
    );
  }

  if (reportingResult?.shouldFail) {
    return { error: true };
  }
};
