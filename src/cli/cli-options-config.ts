export const cliOptionsConfig = {
  'ignored-error-codes': {
    type: 'string',
    description:
      'Path to a JSON file with an array of TSC error codes that should be ignored',
    default: 'ignored-error-codes.json',
    normalize: true,
  },
  'loosely-type-checked-files': {
    type: 'string',
    description:
      'Path to a JSON file with an array of file paths that should be loosely checked.' +
      '\nSpecified errors will be ignored in those files.',
    default: 'loosely-type-checked-files.json',
    normalize: true,
  },
  init: {
    alias: ['i'],
    type: 'boolean',
    description: 'Initialize the JSON files with existing TSC errors',
    default: false,
  },
  'auto-update': {
    type: 'boolean',
    description:
      'When specified, the files that no longer have errors will be removed from the list of loosely type-checked files',
    default: false,
  },
} as const;
