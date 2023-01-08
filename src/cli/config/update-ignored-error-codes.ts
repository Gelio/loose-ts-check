import { areSetsEqual } from '../../utils';
import { CliDependencies } from '../cli-dependencies';

export function updateIgnoredErrorCodes(
  {
    cliOptions,
    log,
    saveJSONFile,
  }: Pick<CliDependencies, 'cliOptions' | 'log' | 'saveJSONFile'>,
  ignoredErrorCodes: ReadonlySet<string>,
  updatedIgnoredErrorCodes: Set<string>,
) {
  if (areSetsEqual(ignoredErrorCodes, updatedIgnoredErrorCodes)) {
    return;
  }

  log('Updating the list of ignored error codes...');

  const error = saveJSONFile(
    cliOptions['ignored-error-codes'],
    Array.from(updatedIgnoredErrorCodes).sort(),
  );

  if (error) {
    log('Error when saving the list of ignored error codes');
    log(error.message);
  } else {
    log('The list of ignored error codes updated successfully');
  }
}
