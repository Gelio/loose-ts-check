import * as chalk from 'chalk';
import { getDefaultCliOptions } from './get-default-cli-options';
import { Program } from './program';
import { CliDependencies } from './cli-dependencies';

describe('program', () => {
  const cliDependencies: CliDependencies = {
    cliOptions: getDefaultCliOptions(),
    log: jest.fn(),
    readJSONArray: jest.fn(),
    saveJSONFile: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (cliDependencies.readJSONArray as jest.Mock).mockImplementation(() => []);
  });

  beforeAll(() => {
    // @ts-expect-error
    chalk.level = 0;
  });

  describe('when initializing config files', () => {
    const initCliDependencies: typeof cliDependencies = {
      ...cliDependencies,
      cliOptions: {
        ...cliDependencies.cliOptions,
        init: true,
      },
    };

    it('should not initialize when no errors', () => {
      const program = new Program(initCliDependencies);
      const result = program.finish();

      expect(result).toBeUndefined();
      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledTimes(0);
    });

    it('should initialize when there are errors', () => {
      const filePath = 'app/pages/site/site-pipelines/new.ts';
      const tsErrorCode = 'TS2532';

      const program = new Program(initCliDependencies);
      program.processLine(createErrorLine(filePath, tsErrorCode));
      const result = program.finish();

      expect(result).toBeUndefined();
      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledTimes(2);
      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledWith(
        initCliDependencies.cliOptions['loosely-type-checked-files'],
        [filePath],
      );
      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledWith(
        initCliDependencies.cliOptions['ignored-error-codes'],
        [tsErrorCode],
      );
    });

    it('should handle different paths in options', () => {
      const temporaryCliDependencies: typeof initCliDependencies = {
        ...initCliDependencies,
        cliOptions: {
          ...initCliDependencies.cliOptions,
          'ignored-error-codes': 'ignored.json',
          'loosely-type-checked-files': 'files.json',
        },
      };

      const filePath = 'app/pages/site/site-pipelines/new.ts';
      const tsErrorCode = 'TS2532';

      const program = new Program(temporaryCliDependencies);
      program.processLine(createErrorLine(filePath, tsErrorCode));
      const result = program.finish();

      expect(result).toBeUndefined();
      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledTimes(2);
      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledWith(
        'files.json',
        [filePath],
      );
      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledWith(
        'ignored.json',
        [tsErrorCode],
      );
    });
  });

  describe('when reading existing config', () => {
    it('should reading/parsing log errors', () => {
      (cliDependencies.readJSONArray as jest.Mock)
        .mockImplementationOnce(() => new Error('Cannot parse array.'))
        .mockImplementationOnce(() => new Error('Cannot parse another array.'));

      expect(() => new Program(cliDependencies)).toThrowError();
      expect(cliDependencies.log).toHaveBeenCalledWith('Cannot parse array.');
      expect(cliDependencies.log).toHaveBeenCalledWith(
        'Cannot parse another array.',
      );
    });

    it('should read config from files from options', () => {
      const temporaryCliDependencies: typeof cliDependencies = {
        ...cliDependencies,
        cliOptions: {
          ...cliDependencies.cliOptions,
          'ignored-error-codes': 'ignored.json',
          'loosely-type-checked-files': 'files.json',
        },
      };
      (cliDependencies.readJSONArray as jest.Mock).mockImplementation(() => []);

      new Program(temporaryCliDependencies);

      expect(cliDependencies.readJSONArray).toHaveBeenCalledWith(
        'ignored.json',
        false,
      );
      expect(cliDependencies.readJSONArray).toHaveBeenCalledWith(
        'files.json',
        false,
      );
    });
  });

  it('should fail if there are invalid TSC error codes in the config', () => {
    (cliDependencies.readJSONArray as jest.Mock).mockImplementation(
      (path: string) =>
        path === cliDependencies.cliOptions['ignored-error-codes']
          ? ['invalid code', 'another invalid code']
          : [],
    );

    expect(() => new Program(cliDependencies)).toThrowError();
    expect(cliDependencies.log).toHaveBeenCalledWith(
      expect.stringContaining('Invalid TSC error codes'),
    );
  });

  it('should succeed if there are no TSC errors in the input', () => {
    const program = new Program(cliDependencies);
    const result = program.finish();

    expect(result).toBeUndefined();
    expect(cliDependencies.log).toHaveBeenCalledWith(
      expect.stringContaining('No TSC errors detected'),
    );
  });

  describe('with valid config and input', () => {
    let looselyTypeCheckedFiles: string[] = [];
    let ignoredErrorCodes: string[] = [];

    beforeEach(() => {
      (cliDependencies.readJSONArray as jest.Mock).mockImplementation((path) =>
        path === cliDependencies.cliOptions['ignored-error-codes']
          ? ignoredErrorCodes
          : looselyTypeCheckedFiles,
      );
    });

    it('should report the number of all errors', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];

      const program = new Program(cliDependencies);
      const errors = [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining('4 errors detected'),
      );
    });

    it('should report the number of ignored errors', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];

      const program = new Program(cliDependencies);
      const errors = [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining('1 errors have been ignored.'),
      );
    });

    it('should report the number of unignored errors', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];

      const program = new Program(cliDependencies);
      const errors = [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining('3 errors were not ignored'),
      );
    });

    it('should report the number of errors that could be ignored', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];

      const program = new Program(cliDependencies);
      const errors = [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining('1 errors could be ignored'),
      );
    });

    it('should display the errors that could be ignored', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];

      const program = new Program(cliDependencies);
      const errors = [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
        createErrorLine('d', 'TS1234'),
      ];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        createErrorLine('c', 'TS1234'),
      );
      expect(cliDependencies.log).toHaveBeenCalledWith(
        createErrorLine('d', 'TS1234'),
      );
    });

    it('should report the number of files that no longer have to be ignored', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];

      const program = new Program(cliDependencies);
      const errors = [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(
          '1 loosely type-checked files no longer have any errors and could be strictly type-checked.',
        ),
      );
    });

    it('should report the number valid TSC errors', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];

      const program = new Program(cliDependencies);
      const errors = [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(
          '2 errors could not be ignored as those codes are not in the ignored list.',
        ),
      );
    });

    it('should display valid TSC errors', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];

      const program = new Program(cliDependencies);
      const errors = [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        createErrorLine('a', 'TS1597'),
      );
      expect(cliDependencies.log).toHaveBeenCalledWith(
        createErrorLine('c', 'TS1111'),
      );
    });

    it('should report the number of ignored errors that did not occur', () => {
      looselyTypeCheckedFiles = ['a'];
      ignoredErrorCodes = ['TS1111', 'TS2222', 'TS3333'];

      const program = new Program(cliDependencies);
      const errors = [createErrorLine('a', 'TS1111')];
      for (let error of errors) {
        program.processLine(error);
      }
      const result = program.finish();

      expect(result).toBeUndefined();
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(
          '2 currently ignored error codes did not occur',
        ),
      );
    });

    describe('when using auto-update', () => {
      const temporaryCliDependencies: typeof cliDependencies = {
        ...cliDependencies,
        cliOptions: {
          ...cliDependencies.cliOptions,
          'auto-update': true,
        },
      };

      it('should add new loosely type-checked files whose errors can be ignored', () => {
        looselyTypeCheckedFiles = ['a', 'b'];
        ignoredErrorCodes = ['TS1111', 'TS2222'];

        const program = new Program(temporaryCliDependencies);
        const errors = [
          createErrorLine('a', 'TS1111'),
          createErrorLine('b', 'TS1111'),
          createErrorLine('c', 'TS2222'),
        ];
        for (let error of errors) {
          program.processLine(error);
        }
        const result = program.finish();

        expect(result).toBeUndefined();
        expect(temporaryCliDependencies.saveJSONFile).toHaveBeenCalledWith(
          temporaryCliDependencies.cliOptions['loosely-type-checked-files'],
          ['a', 'b', 'c'],
        );
      });

      it('should remove loosely type-checked file paths that have no errors', () => {
        looselyTypeCheckedFiles = ['a', 'b'];
        ignoredErrorCodes = ['TS1111'];

        const program = new Program(temporaryCliDependencies);
        const errors = [createErrorLine('a', 'TS1111')];
        for (let error of errors) {
          program.processLine(error);
        }
        const result = program.finish();

        expect(result).toBeUndefined();
        expect(temporaryCliDependencies.saveJSONFile).toHaveBeenCalledWith(
          temporaryCliDependencies.cliOptions['loosely-type-checked-files'],
          ['a'],
        );
      });

      it('should remove error codes that did not occur', () => {
        looselyTypeCheckedFiles = ['a'];
        ignoredErrorCodes = ['TS1111', 'TS2222'];

        const program = new Program(temporaryCliDependencies);
        const errors = [createErrorLine('a', 'TS1111')];
        for (let error of errors) {
          program.processLine(error);
        }
        const result = program.finish();

        expect(result).toBeUndefined();
        expect(temporaryCliDependencies.saveJSONFile).toHaveBeenCalledWith(
          temporaryCliDependencies.cliOptions['ignored-error-codes'],
          ['TS1111'],
        );
      });

      it('should apply both operations on loosely type-checked files correctly', () => {
        looselyTypeCheckedFiles = [
          'file that has ignored error',
          'file that has no errors',
          'new file that has an ignored error',
        ];
        ignoredErrorCodes = ['TS1111'];

        const program = new Program(temporaryCliDependencies);
        const errors = [
          createErrorLine('file that has ignored error', 'TS1111'),
          createErrorLine('new file that has an ignored error', 'TS1111'),
          createErrorLine('new file that has a new error', 'TS2222'),
        ];
        for (let error of errors) {
          program.processLine(error);
        }
        const result = program.finish();

        expect(result?.error).toBe(true);
        expect(temporaryCliDependencies.saveJSONFile).toHaveBeenCalledWith(
          temporaryCliDependencies.cliOptions['loosely-type-checked-files'],
          ['file that has ignored error', 'new file that has an ignored error'],
        );
      });

      it('should exit with success with auto-update results in no valid TS errors', () => {
        looselyTypeCheckedFiles = [
          'file that has ignored error',
          'file that has no errors',
          'new file that has an ignored error',
        ];
        ignoredErrorCodes = ['TS1111'];

        const program = new Program(temporaryCliDependencies);
        const errors = [
          createErrorLine('file that has ignored error', 'TS1111'),
          createErrorLine('new file that has an ignored error', 'TS1111'),
        ];
        for (let error of errors) {
          program.processLine(error);
        }
        const result = program.finish();

        expect(result).toBeUndefined();
        expect(temporaryCliDependencies.saveJSONFile).toHaveBeenCalledWith(
          temporaryCliDependencies.cliOptions['loosely-type-checked-files'],
          ['file that has ignored error', 'new file that has an ignored error'],
        );
      });
    });
  });
});

const createErrorLine = (
  path: string,
  tsErrorCode: string,
  description = 'stub error description generated in test',
) => `${path}(94,15): error ${tsErrorCode}: ${description}`;
