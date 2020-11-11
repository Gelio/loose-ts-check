import { ReportResult } from './report-result';

export const aggregateReportingResults = (
  reportResults: ReportResult[],
): ReportResult =>
  reportResults.some((result) => result !== undefined)
    ? { shouldFail: true }
    : undefined;
