import { TscError } from './types';

const tscErrorLineRegExp = /^(.*)\(\d+,\d+\): error (TS\d{4,}):.*$/;

export const parseTscLine = (
  tscOutputLine: string,
  lastTscError?: TscError | undefined,
) => {
  const line = tscOutputLine.trim();
  if (line.length == 0) {
    return lastTscError;
  }

  const errorLineMatch = line.match(tscErrorLineRegExp);

  if (!errorLineMatch) {
    if (lastTscError) {
      lastTscError.rawErrorLines.push(line);
    }
    return lastTscError;
  }

  const tscError: TscError = {
    filePath: errorLineMatch[1],
    tscErrorCode: errorLineMatch[2],
    rawErrorLines: [line],
  };

  return tscError;
};
