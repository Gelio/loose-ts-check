import { TscError } from '../../tsc-errors';
import { getDefaultCliOptions } from '../get-default-cli-options';
import { initializeConfigurationFiles } from './initialize-config-files';

describe('initializeConfigurationFiles', () => {
  const cliDependencies: Parameters<typeof initializeConfigurationFiles>[0] = {
    cliOptions: getDefaultCliOptions(),
    log: jest.fn(),
    saveJSONFile: jest.fn(),
  };

  const tscErrors: TscError[] = [
    {
      filePath: 'a',
      rawErrorLines: [],
      tscErrorCode: 'TS1234',
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should save files', () => {
    initializeConfigurationFiles(cliDependencies, tscErrors);

    expect(cliDependencies.saveJSONFile).toHaveBeenCalledTimes(2);
    expect(cliDependencies.saveJSONFile).toHaveBeenCalledWith(
      cliDependencies.cliOptions['ignored-error-codes'],
      ['TS1234'],
    );
    expect(cliDependencies.saveJSONFile).toHaveBeenCalledWith(
      cliDependencies.cliOptions['loosely-type-checked-files'],
      ['a'],
    );
  });

  it('should report errors when saving loosely type-checked files failed', () => {
    (cliDependencies.saveJSONFile as jest.Mock).mockImplementation((path) =>
      path === cliDependencies.cliOptions['loosely-type-checked-files']
        ? new Error('Saving failed')
        : undefined,
    );

    initializeConfigurationFiles(cliDependencies, tscErrors);

    expect(cliDependencies.log).toHaveBeenCalledWith(
      expect.stringContaining('Saving failed'),
    );
  });

  it('should report errors when saving ignored error codes failed', () => {
    (cliDependencies.saveJSONFile as jest.Mock).mockImplementation((path) =>
      path === cliDependencies.cliOptions['ignored-error-codes']
        ? new Error('Saving failed')
        : undefined,
    );

    initializeConfigurationFiles(cliDependencies, tscErrors);

    expect(cliDependencies.log).toHaveBeenCalledWith(
      expect.stringContaining('Saving failed'),
    );
  });
});
