import { red } from 'chalk';

import { TscError } from '../../tsc-errors';
import { CliDependencies } from '../cli-dependencies';
import { ReportResult } from './report-result';

export function reportValidTscErrors(
  { log }: Pick<CliDependencies, 'log'>,
  validTscErrors: TscError[],
): ReportResult {
  if (validTscErrors.length === 0) {
    return;
  }

  log(
    `${red(
      validTscErrors.length,
    )} errors could not be ignored as those codes are not in the ignored list.`,
  );

  validTscErrors.forEach((error) => log(error.rawErrorLines.join('\n')));

  return { shouldFail: true };
}
