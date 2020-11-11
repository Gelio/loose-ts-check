import { aggregateReportingResults } from './aggregate-reporting-results';

describe('aggregateReportingResults', () => {
  it('should return failure when there is at least 1 failure', () => {
    const result = aggregateReportingResults([
      undefined,
      undefined,
      { shouldFail: true },
      undefined,
    ]);

    expect(result?.shouldFail).toBe(true);
  });

  it('should return undefined when there are no failures', () => {
    const result = aggregateReportingResults([undefined, undefined, undefined]);

    expect(result).toBeUndefined();
  });

  it('should return undefined when there are no results', () => {
    const result = aggregateReportingResults([]);

    expect(result).toBeUndefined();
  });
});
