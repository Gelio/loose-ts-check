import { FilePathMatcher } from '../../file-path-matcher';
import { TscError } from '../../tsc-errors/types';
import { CliDependencies } from '../cli-dependencies';
import { aggregateReportingResults } from './aggregate-reporting-results';
import { reportIgnoredErrorsThatDidNotOccur } from './report-ignored-errors-that-did-not-occur';
import { reportLooselyTypeCheckedFilePathsWithoutErrors } from './report-loosely-type-checked-file-paths-without-errors';
import { reportTscErrorsThatCouldBeIgnored } from './report-tsc-errors-that-could-be-ignored';
import { reportValidTscErrors } from './report-valid-tsc-errors';

const generateReport = (
  cliDependencies: CliDependencies,
  tscErrors: TscError[],
  tscErrorsThatCouldBeIgnored: TscError[],
  validTscErrors: TscError[],
  filePathMatcher: FilePathMatcher,
  updatedLooselyTypeCheckedFilePaths: Set<string>,
  updatedIgnoredErrorCodes: Set<string>,
) => {
  return aggregateReportingResults([
    reportTscErrorsThatCouldBeIgnored(
      cliDependencies,
      tscErrorsThatCouldBeIgnored,
      updatedLooselyTypeCheckedFilePaths,
    ),
    reportLooselyTypeCheckedFilePathsWithoutErrors(
      cliDependencies,
      filePathMatcher,
      updatedLooselyTypeCheckedFilePaths,
      tscErrors,
    ),
    reportValidTscErrors(cliDependencies, validTscErrors),
    reportIgnoredErrorsThatDidNotOccur(
      cliDependencies,
      tscErrors,
      updatedIgnoredErrorCodes,
    ),
  ]);
};

export default generateReport;
