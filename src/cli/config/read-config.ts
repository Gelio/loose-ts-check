import { yellow } from 'chalk';

import { CliDependencies } from '../cli-dependencies';

export const readConfig = ({
  readJSONArray,
  log,
  cliOptions,
}: Pick<CliDependencies, 'readJSONArray' | 'log' | 'cliOptions'>) => {
  const ignoredErrorCodesArray: readonly string[] | Error = readJSONArray(
    cliOptions['ignored-error-codes'],
    cliOptions.init,
  );
  const looselyTypeCheckedFilePathsArray:
    | readonly string[]
    | Error = readJSONArray(
    cliOptions['loosely-type-checked-files'],
    cliOptions.init,
  );

  if (
    !Array.isArray(ignoredErrorCodesArray) ||
    !Array.isArray(looselyTypeCheckedFilePathsArray)
  ) {
    if (ignoredErrorCodesArray instanceof Error) {
      log(ignoredErrorCodesArray.message);
    }
    if (looselyTypeCheckedFilePathsArray instanceof Error) {
      log(looselyTypeCheckedFilePathsArray.message);
    }

    log(yellow('Either fix the files or pass the --init option'));

    return;
  }

  return {
    ignoredErrorCodesArray,
    looselyTypeCheckedFilePathsArray,
  };
};
