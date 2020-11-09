import { TscError } from './types';

export const parseTscErrors = (tscOutput: string) => {
  const tsErrorCodeRegexp = /TS\d{4,}/;

  const linesWithErrors = tscOutput
    .split('\n')
    .filter((line) => tsErrorCodeRegexp.test(line));

  const errorLineRegExp = /^(?<filePath>.*)\(\d+,\d+\): error (?<tsErrorCode>TS\d{4,}):.*$/;

  return linesWithErrors.map(
    (line): TscError => {
      const errorLineMatch = line.match(errorLineRegExp);

      if (!errorLineMatch) {
        throw new Error(
          `Line was mistakingly caught as a TS error, but it does not match the line-parsing regexp:\n${line}`,
        );
      }

      if (!errorLineMatch.groups) {
        throw new Error('Regexp capture groups are not supported');
      }

      return {
        filePath: errorLineMatch.groups.filePath,
        tscErrorCode: errorLineMatch.groups.tsErrorCode,
      };
    },
  );
};
