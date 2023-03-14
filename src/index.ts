import yargs from 'yargs';
import { createInterface } from 'readline';

import {
  CliOptions,
  cliOptionsConfig,
  getCliDependencies,
  Program,
} from './cli';

const options: CliOptions = yargs(process.argv)
  .options(cliOptionsConfig)
  .parseSync();

const cliDependencies = getCliDependencies(options);
const rl = createInterface(process.stdin);
let program: Program;

try {
  program = new Program(cliDependencies);
} catch {
  process.exit(1);
}

rl.on('line', (line) => {
  program.processLine(line);
});

rl.once('close', () => {
  const result = program.finish();
  if (result?.error) {
    process.exit(1);
  }
});
