import { areSetsEqual } from '../../utils';
import { CliDependencies } from '../cli-dependencies';

export function updateLooselyTypeCheckedFilePaths(
  {
    cliOptions,
    log,
    saveJSONFile,
  }: Pick<CliDependencies, 'cliOptions' | 'log' | 'saveJSONFile'>,
  looselyTypeCheckedFilePaths: ReadonlySet<string>,
  updatedLooselyTypeCheckedFilePaths: Set<string>,
) {
  if (
    areSetsEqual(
      looselyTypeCheckedFilePaths,
      updatedLooselyTypeCheckedFilePaths,
    )
  ) {
    return;
  }

  log('Updating the list of loosely type-checked files...');

  const error = saveJSONFile(
    cliOptions['loosely-type-checked-files'],
    Array.from(updatedLooselyTypeCheckedFilePaths).sort(),
  );

  if (error) {
    log('Error when saving the list of loosely type-checked files');
    log(error.message);
  } else {
    log('The list of loosely type-checked files updated successfully');
  }
}
