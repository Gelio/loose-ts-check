import yargs from 'yargs';

import {
  CliOptions,
  cliOptionsConfig,
  getCliDependencies,
  getProgramInput,
  program,
} from './cli';

const options: CliOptions = yargs(process.argv)
  .options(cliOptionsConfig)
  .parseSync();
const cliDependencies = getCliDependencies(options);

getProgramInput()
  .then((programInput) => program(cliDependencies, programInput))
  .then((result) => {
    if (result?.error) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Unknown error', error);
    process.exit(1);
  });
