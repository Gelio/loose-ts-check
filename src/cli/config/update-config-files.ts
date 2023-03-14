import { CliDependencies } from '../cli-dependencies';
import { updateIgnoredErrorCodes } from './update-ignored-error-codes';
import { updateLooselyTypeCheckedFilePaths } from './update-loosely-type-checked-file-paths';

const updateConfigFiles = (
  cliDependencies: CliDependencies,
  looselyTypeCheckedFilePaths: ReadonlySet<string>,
  updatedLooselyTypeCheckedFilePaths: Set<string>,
  ignoredErrorCodesSet: ReadonlySet<string>,
  updatedIgnoredErrorCodes: Set<string>,
) => {
  updateLooselyTypeCheckedFilePaths(
    cliDependencies,
    new Set(looselyTypeCheckedFilePaths),
    updatedLooselyTypeCheckedFilePaths,
  );
  updateIgnoredErrorCodes(
    cliDependencies,
    ignoredErrorCodesSet,
    updatedIgnoredErrorCodes,
  );
};

export default updateConfigFiles;
