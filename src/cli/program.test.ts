import { getDefaultCliOptions } from './get-default-cli-options';
import { program } from './program';

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
        `${filePath}(1,45): error ${tsErrorCode}: Object is possibly 'undefined'.`,
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
        `${filePath}(1,45): error ${tsErrorCode}: Object is possibly 'undefined'.`,
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
});
