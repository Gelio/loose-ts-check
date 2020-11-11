import { getDefaultCliOptions } from './get-default-cli-options';
import { program } from './program';

const chalkReset = '\x1B[39m';

describe('program', () => {
  const cliDependencies: Parameters<typeof program>[0] = {
    cliOptions: getDefaultCliOptions(),
    log: jest.fn(),
    readJSONArray: jest.fn(),
    saveJSONFile: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (cliDependencies.readJSONArray as jest.Mock).mockImplementation(() => []);
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
      const result = program(initCliDependencies, ['', '']);

      expect(result).toBeUndefined();

      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledTimes(0);
    });

    it('should initialize when there are errors errors', () => {
      const filePath = 'app/pages/site/site-pipelines/new.ts';
      const tsErrorCode = 'TS2532';
      const result = program(initCliDependencies, [
        createErrorLine(filePath, tsErrorCode),
      ]);

      expect(result).toBeUndefined();

      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledTimes(2);
      expect(
        initCliDependencies.saveJSONFile,
      ).toHaveBeenCalledWith(
        initCliDependencies.cliOptions['loosely-type-checked-files'],
        [filePath],
      );
      expect(
        initCliDependencies.saveJSONFile,
      ).toHaveBeenCalledWith(
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
      const result = program(temporaryCliDependencies, [
        createErrorLine(filePath, tsErrorCode),
      ]);

      expect(result).toBeUndefined();

      expect(initCliDependencies.saveJSONFile).toHaveBeenCalledTimes(2);
      expect(
        initCliDependencies.saveJSONFile,
      ).toHaveBeenCalledWith('files.json', [filePath]);
      expect(
        initCliDependencies.saveJSONFile,
      ).toHaveBeenCalledWith('ignored.json', [tsErrorCode]);
    });
  });

  describe('when reading existing config', () => {
    it('should reading/parsing log errors', () => {
      (cliDependencies.readJSONArray as jest.Mock)
        .mockImplementationOnce(() => new Error('Cannot parse array'))
        .mockImplementationOnce(() => new Error('Cannot parse another array'));

      const result = program(cliDependencies, ['']);

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith('Cannot parse array');
      expect(cliDependencies.log).toHaveBeenCalledWith(
        'Cannot parse another array',
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

      const result = program(temporaryCliDependencies, ['']);

      expect(result).toBeUndefined();
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

    const result = program(cliDependencies, ['']);

    expect(result?.error).toBe(true);
    expect(cliDependencies.log).toHaveBeenCalledWith(
      expect.stringContaining('Invalid TSC error codes'),
    );
  });

  it('should succeed if there are no TSC errors in the input', () => {
    const result = program(cliDependencies, ['']);

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
      const result = program(cliDependencies, [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ]);

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(`4${chalkReset} errors detected`),
      );
    });

    it('should report the number of ignored errors', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];
      const result = program(cliDependencies, [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ]);

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(`1${chalkReset} errors have been ignored`),
      );
    });

    it('should report the number of unignored errors', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];
      const result = program(cliDependencies, [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ]);

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(`3${chalkReset} errors were not ignored`),
      );
    });

    it('should report the number of errors that could be ignored', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];
      const result = program(cliDependencies, [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ]);

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(`1${chalkReset} errors could be ignored`),
      );
    });

    it('should report the number of files that no longer have to be ignored', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];
      const result = program(cliDependencies, [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ]);

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(
          `1${chalkReset} loosely type-checked files no longer have any errors and could be strictly type-checked`,
        ),
      );
    });

    it('should report the number valid TSC errors', () => {
      looselyTypeCheckedFiles = ['a', 'b'];
      ignoredErrorCodes = ['TS1234'];
      const result = program(cliDependencies, [
        createErrorLine('a', 'TS1234'),
        createErrorLine('a', 'TS1597'),
        createErrorLine('c', 'TS1111'),
        createErrorLine('c', 'TS1234'),
      ]);

      expect(result?.error).toBe(true);
      expect(cliDependencies.log).toHaveBeenCalledWith(
        expect.stringContaining(
          `2${chalkReset} errors could not be ignored as those codes are not in the ignored list`,
        ),
      );
    });
  });
});

const createErrorLine = (
  path: string,
  tsErrorCode: string,
  description = 'stub error description generated in test',
) => `${path}(94,15): error ${tsErrorCode}: ${description}`;
