import { red } from 'chalk';
import { TscError } from '../../tsc-errors';
import { CliDependencies } from '../cli-dependencies';
import { getConfigFilesFromErrors } from './get-config-files-from-errors';

export function initializeConfigurationFiles(
  {
    cliOptions,
    log,
    saveJSONFile,
  }: Pick<CliDependencies, 'cliOptions' | 'log' | 'saveJSONFile'>,
  tscErrors: TscError[],
) {
  log('Initializing configuration files...');

  const { looselyTypeCheckedFiles, ignoredErrorCodes } =
    getConfigFilesFromErrors(tscErrors);

  const saveLooselyTypeCheckedFilesError = saveJSONFile(
    cliOptions['loosely-type-checked-files'],
    looselyTypeCheckedFiles,
  );
  if (saveLooselyTypeCheckedFilesError) {
    log(red(`Error when saving ${cliOptions['loosely-type-checked-files']}`));
    log(saveLooselyTypeCheckedFilesError.message);
    return;
  }

  const saveIgnoredErrorCodesError = saveJSONFile(
    cliOptions['ignored-error-codes'],
    ignoredErrorCodes,
  );
  if (saveIgnoredErrorCodesError) {
    log(red(`Error when saving ${cliOptions['ignored-error-codes']}`));
    log(saveIgnoredErrorCodesError.message);
    return;
  }

  log('Configuration files saved successfully');
}
