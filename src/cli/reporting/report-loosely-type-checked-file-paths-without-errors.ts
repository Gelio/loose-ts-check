import { yellow, green } from 'chalk';

import { TscError } from '../../tsc-errors';
import { CliDependencies } from '../cli-dependencies';
import { ReportResult } from './report-result';

export function reportLooselyTypeCheckedFilePathsWithoutErrors(
  { log, cliOptions }: Pick<CliDependencies, 'log' | 'cliOptions'>,
  looselyTypeCheckedFilePaths: Set<string>,
  tscErrors: TscError[],
): ReportResult {
  if (tscErrors.length === 0) {
    return;
  }

  const filePathsWithErrors = new Set(
    tscErrors.map((tscError) => tscError.filePath),
  );

  const looselyTypeCheckedFilePathsWithoutErrors = Array.from(
    looselyTypeCheckedFilePaths,
  ).filter((filePath) => !filePathsWithErrors.has(filePath));

  if (looselyTypeCheckedFilePathsWithoutErrors.length === 0) {
    return;
  }

  log(
    `${yellow(
      looselyTypeCheckedFilePathsWithoutErrors.length,
    )} loosely type-checked files no longer have any errors and could be strictly type-checked.`,
  );

  log(looselyTypeCheckedFilePathsWithoutErrors);

  if (!cliOptions['auto-update']) {
    log(
      `Use the ${green(
        '--auto-update',
      )} option to update the registry automatically.`,
    );

    return {
      shouldFail: true,
    };
  }

  looselyTypeCheckedFilePathsWithoutErrors.forEach((filePath) => {
    looselyTypeCheckedFilePaths.delete(filePath);
  });
  log('Registry will be updated');
}
