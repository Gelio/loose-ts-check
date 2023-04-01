import { green, yellow } from 'chalk';
import { TscError } from '../../tsc-errors';
import { CliDependencies } from '../cli-dependencies';
import { ReportResult } from './report-result';

export function reportTscErrorsThatCouldBeIgnored(
  { log }: Pick<CliDependencies, 'log'>,
  tscErrorsThatCouldBeIgnored: TscError[],
): ReportResult {
  if (tscErrorsThatCouldBeIgnored.length === 0) {
    return;
  }

  log(
    `${yellow(
      tscErrorsThatCouldBeIgnored.length,
    )} errors could be ignored, as their error codes are ignored`,
  );

  tscErrorsThatCouldBeIgnored.forEach((tscError) =>
    log(tscError.rawErrorLines.join('\n')),
  );

  log(
    `Use the ${green(
      '--init',
    )} option to add these file paths to the registry.`,
  );

  return {
    shouldFail: true,
  };
}
