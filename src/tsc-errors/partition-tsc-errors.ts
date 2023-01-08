import { FilePathMatcher } from '../file-path-matcher';
import { partition } from '../utils';

import { TscError } from './types';

export const partitionTscErrors = ({
  tscErrors,
  looselyTypeCheckedFilePathMatcher,
  ignoredErrorCodes,
}: {
  tscErrors: TscError[];
  looselyTypeCheckedFilePathMatcher: FilePathMatcher;
  ignoredErrorCodes: ReadonlySet<string>;
}) => {
  const [ignoredTscErrors, unignoredTscErrors] = partition(
    tscErrors,
    (tscError) =>
      looselyTypeCheckedFilePathMatcher.matches(tscError.filePath) &&
      ignoredErrorCodes.has(tscError.tscErrorCode),
  );

  const [tscErrorsThatCouldBeIgnored, validTscErrors] = partition(
    unignoredTscErrors,
    (tscError) => ignoredErrorCodes.has(tscError.tscErrorCode),
  );

  return {
    ignoredTscErrors,
    unignoredTscErrors,
    tscErrorsThatCouldBeIgnored,
    validTscErrors,
  };
};
