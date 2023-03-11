import { green, yellow } from 'chalk';
import { TscError } from '../../tsc-errors';
import { CliDependencies } from '../cli-dependencies';
import { ReportResult } from './report-result';

export const reportIgnoredErrorsThatDidNotOccur = (
  { cliOptions, log }: Pick<CliDependencies, 'cliOptions' | 'log'>,
  tscErrors: TscError[],
  ignoredErrorCodes: Set<string>,
): ReportResult => {
  const presentTscErrorCodes = new Set(
    tscErrors.map((tscError) => tscError.tscErrorCode),
  );

  const tscErrorCodesThatDidNotOccur = Array.from(ignoredErrorCodes).filter(
    (tscErrorCode) => !presentTscErrorCodes.has(tscErrorCode),
  );

  if (tscErrorCodesThatDidNotOccur.length === 0) {
    return;
  }

  log(
    `${yellow(
      tscErrorCodesThatDidNotOccur.length,
    )} currently ignored error codes did not occur.`,
  );

  if (!cliOptions['auto-update']) {
    log(
      `Use the ${green(
        '--auto-update',
      )} option to update the registry automatically.`,
    );
    return;
  }

  tscErrorCodesThatDidNotOccur.forEach((tscErrorCode) => {
    ignoredErrorCodes.delete(tscErrorCode);
  });
  log('Registry will be updated.');
};
