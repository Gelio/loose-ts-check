import { green, yellow } from 'chalk';
import { TscError } from '../../tsc-errors';
import { CliDependencies } from '../cli-dependencies';
import { ReportResult } from './report-result';

export function reportTscErrorsThatCouldBeIgnored(
  { log, cliOptions }: Pick<CliDependencies, 'log' | 'cliOptions'>,
  tscErrorsThatCouldBeIgnored: TscError[],
  looselyTypeCheckedFilePaths: Set<string>,
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

  const initialLooselyTypeCheckedFilesCount =
    tscErrorsThatCouldBeIgnored.length;
  tscErrorsThatCouldBeIgnored.forEach((tscError) => {
    looselyTypeCheckedFilePaths.add(tscError.filePath);
  });
  const additionalLooselyTypeCheckedFilePaths =
    tscErrorsThatCouldBeIgnored.length - initialLooselyTypeCheckedFilesCount;

  log(
    `Additional ${yellow(
      additionalLooselyTypeCheckedFilePaths,
    )} files will be ignored - registry will be updated`,
  );
}
