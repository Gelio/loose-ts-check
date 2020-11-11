import { reportValidTscErrors } from './report-valid-tsc-errors';

describe('reportValidTscErrors', () => {
  const dependencies: Parameters<typeof reportValidTscErrors>[0] = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should not fail when there are no errors', () => {
    const result = reportValidTscErrors(dependencies, []);

    expect(result).toBeUndefined();
  });

  it('should fail when there are errors', () => {
    const result = reportValidTscErrors(dependencies, [
      { filePath: 'a', tscErrorCode: 'TS1234', rawErrorLines: [] },
    ]);

    expect(result?.shouldFail).toBe(true);
  });

  it('should log raw error lines', () => {
    reportValidTscErrors(dependencies, [
      {
        filePath: 'a',
        tscErrorCode: 'TS1234',
        rawErrorLines: ['error a', 'details'],
      },
      {
        filePath: 'b',
        tscErrorCode: 'TS1234',
        rawErrorLines: ['error b', 'details'],
      },
    ]);

    expect(dependencies.log).toHaveBeenCalledWith('error a\ndetails');
    expect(dependencies.log).toHaveBeenCalledWith('error b\ndetails');
  });
});
