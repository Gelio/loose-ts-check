import { CliOptions } from './cli-options';
import { readJSONArray, saveJSONFile } from './io';

export interface CliDependencies {
  log: typeof console.log;
  saveJSONFile: typeof saveJSONFile;
  readJSONArray: typeof readJSONArray;
  cliOptions: CliOptions;
}

export const getCliDependencies = (
  cliOptions: CliOptions,
): CliDependencies => ({
  cliOptions,
  log: console.log.bind(console),
  saveJSONFile,
  readJSONArray,
});
