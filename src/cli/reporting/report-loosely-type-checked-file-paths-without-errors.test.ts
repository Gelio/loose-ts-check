import { FilePathMatcher } from '../../file-path-matcher';
import { getDefaultCliOptions } from '../get-default-cli-options';
import { reportLooselyTypeCheckedFilePathsWithoutErrors } from './report-loosely-type-checked-file-paths-without-errors';

describe('reportLooselyTypeCheckedFilePathsWithoutErrors', () => {
  const dependencies: Parameters<
    typeof reportLooselyTypeCheckedFilePathsWithoutErrors
  >[0] = {
    cliOptions: getDefaultCliOptions(),
    log: jest.fn(),
  };

  it('should not fail when there are no errors', () => {
    const result = reportLooselyTypeCheckedFilePathsWithoutErrors(
      dependencies,
      new FilePathMatcher([]),
      new Set(),
      [],
    );

    expect(result).toBeUndefined();
  });

  it('should not fail when all loosely type-checked files have errors', () => {
    const pathMatcher = new FilePathMatcher(['a']);
    pathMatcher.matches('a');

    const result = reportLooselyTypeCheckedFilePathsWithoutErrors(
      dependencies,
      pathMatcher,
      new Set(['a']),
      [
        {
          filePath: 'a',
          rawErrorLines: [],
          tscErrorCode: 'TS1234',
        },
        {
          filePath: 'b',
          rawErrorLines: [],
          tscErrorCode: 'TS1235',
        },
      ],
    );

    expect(result).toBeUndefined();
  });

  it('should remove loosely type-checked paths when they have no errors', () => {
    const looselyTypeCheckedPathsArray = ['a', 'b', 'c', 'd'];
    const looselyTypeCheckedPaths = new Set(looselyTypeCheckedPathsArray);

    const temporaryDependencies: typeof dependencies = {
      ...dependencies,
      cliOptions: {
        ...dependencies.cliOptions,
        'auto-update': true,
      },
    };
    const pathMatcher = new FilePathMatcher(looselyTypeCheckedPathsArray);
    pathMatcher.matches('a');
    pathMatcher.matches('b');

    const result = reportLooselyTypeCheckedFilePathsWithoutErrors(
      temporaryDependencies,
      pathMatcher,
      looselyTypeCheckedPaths,
      [
        {
          filePath: 'a',
          rawErrorLines: [],
          tscErrorCode: 'TS1234',
        },
        {
          filePath: 'b',
          rawErrorLines: [],
          tscErrorCode: 'TS1235',
        },
      ],
    );

    expect(result).toBeUndefined();
    expect(Array.from(looselyTypeCheckedPaths)).toEqual(['a', 'b']);
  });
});
