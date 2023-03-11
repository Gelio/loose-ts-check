import * as chalk from 'chalk';
import { CliDependencies } from './cli';
import { initializeConfigurationFiles } from './cli/config';
import updateConfigFiles from './cli/config/update-config-files';
import generateReport from './cli/reporting/generate-report';
import { FilePathMatcher } from './file-path-matcher';
import { TscError } from './tsc-errors';

export interface ProcessCompilateResultsInput {
  cliDependencies: CliDependencies;
  looselyTypeCheckedFilePathsArray: string[];
  looselyTypeCheckedFilePathMatcher: FilePathMatcher;
  ignoredErrorCodes: ReadonlySet<string>;
  tscErrors: TscError[];
  ignoredTscErrors: TscError[];
  reportedTscErrors: TscError[];
  validTscErrors: TscError[];
  tscErrorsThatCouldBeIgnored: TscError[];
}

const processCompilationResults = (input: ProcessCompilateResultsInput) => {
  const {
    cliDependencies,
    looselyTypeCheckedFilePathsArray,
    looselyTypeCheckedFilePathMatcher,
    ignoredErrorCodes,
    tscErrors,
    ignoredTscErrors,
    reportedTscErrors,
    validTscErrors,
    tscErrorsThatCouldBeIgnored,
  } = input;

  if (tscErrors.length === 0) {
    cliDependencies.log(chalk.green('No TSC errors detected.'));
    return;
  }

  cliDependencies.log(`${chalk.red(tscErrors.length)} errors detected.`);

  if (cliDependencies.cliOptions.init) {
    initializeConfigurationFiles(cliDependencies, tscErrors);
    return;
  }

  cliDependencies.log(
    `${chalk.yellow(ignoredTscErrors.length)} errors have been ignored.`,
  );
  cliDependencies.log(
    `${chalk.red(reportedTscErrors.length)} errors were not ignored.`,
  );

  const updatedLooselyTypeCheckedFilePaths = new Set(
    looselyTypeCheckedFilePathsArray,
  );
  const updatedIgnoredErrorCodes = new Set(ignoredErrorCodes);

  const reportingResult = generateReport(
    cliDependencies,
    tscErrors,
    tscErrorsThatCouldBeIgnored,
    validTscErrors,
    looselyTypeCheckedFilePathMatcher,
    updatedLooselyTypeCheckedFilePaths,
    updatedIgnoredErrorCodes,
  );

  if (cliDependencies.cliOptions['auto-update']) {
    updateConfigFiles(
      cliDependencies,
      new Set(looselyTypeCheckedFilePathsArray),
      updatedLooselyTypeCheckedFilePaths,
      ignoredErrorCodes,
      updatedIgnoredErrorCodes,
    );
  }

  if (reportingResult?.shouldFail) {
    return { error: true };
  }
};

export default processCompilationResults;
