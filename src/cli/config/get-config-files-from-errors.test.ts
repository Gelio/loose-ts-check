import { getConfigFilesFromErrors } from './get-config-files-from-errors';

describe('getConfigFilesFromErrors', () => {
  it('should return empty config files when there are no errors', () => {
    const result = getConfigFilesFromErrors([]);

    expect(result.ignoredErrorCodes).toHaveLength(0);
    expect(result.looselyTypeCheckedFiles).toHaveLength(0);
  });

  it('should return a list of unique error codes and unique file paths', () => {
    const result = getConfigFilesFromErrors([
      {
        filePath: 'a',
        tscErrorCode: 'TS1234',
        rawErrorLines: [],
      },
      {
        filePath: 'a',
        tscErrorCode: 'TS1235',
        rawErrorLines: [],
      },
      {
        filePath: 'b',
        tscErrorCode: 'TS1234',
        rawErrorLines: [],
      },
      {
        filePath: 'c',
        tscErrorCode: 'TS1236',
        rawErrorLines: [],
      },
    ]);

    expect(result.ignoredErrorCodes).toHaveLength(3);
    expect(result.ignoredErrorCodes).toContain('TS1234');
    expect(result.ignoredErrorCodes).toContain('TS1235');
    expect(result.ignoredErrorCodes).toContain('TS1236');
    expect(result.looselyTypeCheckedFiles).toHaveLength(3);
    expect(result.looselyTypeCheckedFiles).toContain('a');
    expect(result.looselyTypeCheckedFiles).toContain('b');
    expect(result.looselyTypeCheckedFiles).toContain('c');
  });

  it('should sort the returned lists', () => {
    const result = getConfigFilesFromErrors([
      {
        filePath: 'x',
        tscErrorCode: 'TS1238',
        rawErrorLines: [],
      },
      {
        filePath: 'c',
        tscErrorCode: 'TS1235',
        rawErrorLines: [],
      },
      {
        filePath: 'z',
        tscErrorCode: 'TS1240',
        rawErrorLines: [],
      },
      {
        filePath: 'a',
        tscErrorCode: 'TS1220',
        rawErrorLines: [],
      },
    ]);

    expect(result.ignoredErrorCodes).toEqual([
      'TS1220',
      'TS1235',
      'TS1238',
      'TS1240',
    ]);
    expect(result.looselyTypeCheckedFiles).toEqual(['a', 'c', 'x', 'z']);
  });
});
