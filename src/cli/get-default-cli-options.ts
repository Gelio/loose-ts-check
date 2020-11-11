import { CliOptions } from './cli-options';

export const getDefaultCliOptions = (): CliOptions => ({
  'auto-update': false,
  'ignored-error-codes': 'ignored-error-codes.json',
  'loosely-type-checked-files': 'loosely-type-checked-files.json',
  init: false,
});
