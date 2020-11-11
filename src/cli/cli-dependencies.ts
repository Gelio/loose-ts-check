import { CliOptions } from './cli-options';
import { saveJSONFile } from './io';

export interface CliDependencies {
  log: typeof console.log;
  saveJSONFile: typeof saveJSONFile;
  cliOptions: CliOptions;
}

export const getCliDependencies = (
  cliOptions: CliOptions,
): CliDependencies => ({
  cliOptions,
  log: console.log.bind(console),
  saveJSONFile,
});
