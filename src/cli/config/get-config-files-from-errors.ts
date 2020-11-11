import { TscError } from '../../tsc-errors';

export const getConfigFilesFromErrors = (tscErrors: TscError[]) => {
  return {
    looselyTypeCheckedFiles: getUniqueSortedArray(
      tscErrors.map((error) => error.filePath),
    ),
    ignoredErrorCodes: getUniqueSortedArray(
      tscErrors.map((error) => error.tscErrorCode),
    ),
  };
};

const getUniqueSortedArray = <T>(arr: T[]) => Array.from(new Set(arr)).sort();
