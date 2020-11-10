import { partitionTscErrors } from './partition-tsc-errors';
import { TscError } from './types';

describe('partitionTscErrors', () => {
  it('should partition errors based on passed in Sets', () => {
    const looselyTypeCheckedFilePaths = new Set(['loose-a', 'loose-b']);
    const ignoredErrorCodes = new Set(['TS1234', 'TS1235']);
    const ignoredTscErrors: TscError[] = [
      {
        filePath: 'loose-a',
        tscErrorCode: 'TS1234',
        rawErrorLines: [],
      },
      {
        filePath: 'loose-b',
        tscErrorCode: 'TS1235',
        rawErrorLines: [],
      },
    ];
    const tscErrorsThatCouldBeIgnored: TscError[] = [
      {
        filePath: 'other-file',
        tscErrorCode: 'TS1234',
        rawErrorLines: [],
      },
    ];

    const validTscErrors: TscError[] = [
      {
        filePath: 'other-file',
        tscErrorCode: 'TS9999',
        rawErrorLines: [],
      },
    ];

    const result = partitionTscErrors({
      tscErrors: [
        ...ignoredTscErrors,
        ...tscErrorsThatCouldBeIgnored,
        ...validTscErrors,
      ],
      ignoredErrorCodes,
      looselyTypeCheckedFilePaths,
    });

    expect(result.ignoredTscErrors).toEqual(ignoredTscErrors);
    expect(result.tscErrorsThatCouldBeIgnored).toEqual(
      tscErrorsThatCouldBeIgnored,
    );
    expect(result.validTscErrors).toEqual(validTscErrors);
    expect(result.unignoredTscErrors).toEqual([
      ...tscErrorsThatCouldBeIgnored,
      ...validTscErrors,
    ]);
  });
});
