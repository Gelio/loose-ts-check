import { getDefaultCliOptions } from '../get-default-cli-options';
import { reportTscErrorsThatCouldBeIgnored } from './report-tsc-errors-that-could-be-ignored';

describe('reportTscErrorsThatCouldBeIgnored', () => {
  const dependencies: Parameters<
    typeof reportTscErrorsThatCouldBeIgnored
  >[0] = {
    cliOptions: getDefaultCliOptions(),
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should not fail when there are no errors', () => {
    const result = reportTscErrorsThatCouldBeIgnored(
      dependencies,
      [],
      new Set(),
    );

    expect(result).toBeUndefined();
  });

  it('should fail when there are errors and auto-update is disabled', () => {
    const result = reportTscErrorsThatCouldBeIgnored(
      dependencies,
      [
        {
          filePath: 'a',
          rawErrorLines: [],
          tscErrorCode: 'TS1234',
        },
      ],
      new Set(),
    );

    expect(result?.shouldFail).toBe(true);
  });

  it('should update the loosely type-checked files when auto-update is on', () => {
    const temporaryDependencies: typeof dependencies = {
      ...dependencies,
      cliOptions: {
        ...dependencies.cliOptions,
        'auto-update': true,
      },
    };

    const looselyTypeCheckedFiles = new Set<string>();
    const result = reportTscErrorsThatCouldBeIgnored(
      temporaryDependencies,
      [
        {
          filePath: 'a',
          rawErrorLines: [],
          tscErrorCode: 'TS1234',
        },
      ],
      looselyTypeCheckedFiles,
    );

    expect(result).toBeUndefined();
    expect(looselyTypeCheckedFiles.has('a')).toBe(true);
  });
});
