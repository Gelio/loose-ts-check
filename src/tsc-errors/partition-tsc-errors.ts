import { partition } from '../utils';

import { TscError } from './types';

export const partitionTscErrors = ({
  tscErrors,
  looselyTypeCheckedFilePaths,
  ignoredErrorCodes,
}: {
  tscErrors: TscError[];
  looselyTypeCheckedFilePaths: ReadonlySet<string>;
  ignoredErrorCodes: ReadonlySet<string>;
}) => {
  const [ignoredTscErrors, unignoredTscErrors] = partition(
    tscErrors,
    (tscError) =>
      looselyTypeCheckedFilePaths.has(tscError.filePath) &&
      ignoredErrorCodes.has(tscError.tscErrorCode),
  );

  const [
    tscErrorsThatCouldBeIgnored,
    validTscErrors,
  ] = partition(unignoredTscErrors, (tscError) =>
    ignoredErrorCodes.has(tscError.tscErrorCode),
  );

  return {
    ignoredTscErrors,
    unignoredTscErrors,
    tscErrorsThatCouldBeIgnored,
    validTscErrors,
  };
};
