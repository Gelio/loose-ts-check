import { areSetsEqual } from '../../utils';
import { CliDependencies } from '../cli-dependencies';

export function updateIgnoredErrorCodes(
  {
    cliOptions,
    log,
    saveJSONFile,
  }: Pick<CliDependencies, 'cliOptions' | 'log' | 'saveJSONFile'>,
  ignoredErrorCodes: Set<string>,
  updatedIgnoredErrorCodes: Set<string>,
) {
  if (areSetsEqual(ignoredErrorCodes, updatedIgnoredErrorCodes)) {
    return;
  }

  log('Updating the list of ignored error codes...');

  try {
    saveJSONFile(
      cliOptions['ignored-error-codes'],
      Array.from(updatedIgnoredErrorCodes).sort(),
    );

    log('The list of ignored error codes updated successfully');
  } catch (error) {
    log('Error when saving the list of ignored error codes');
    log(error.message);
  }
}
