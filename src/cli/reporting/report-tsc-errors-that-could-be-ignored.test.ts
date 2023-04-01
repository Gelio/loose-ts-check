import { reportTscErrorsThatCouldBeIgnored } from './report-tsc-errors-that-could-be-ignored';

describe('reportTscErrorsThatCouldBeIgnored', () => {
  const dependencies: Parameters<typeof reportTscErrorsThatCouldBeIgnored>[0] =
    {
      log: jest.fn(),
    };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should not fail when there are no errors', () => {
    const result = reportTscErrorsThatCouldBeIgnored(dependencies, []);

    expect(result).toBeUndefined();
  });

  it('should fail when there are errors', () => {
    const result = reportTscErrorsThatCouldBeIgnored(dependencies, [
      {
        filePath: 'a',
        rawErrorLines: [],
        tscErrorCode: 'TS1234',
      },
    ]);

    expect(result?.shouldFail).toBe(true);
  });
});
