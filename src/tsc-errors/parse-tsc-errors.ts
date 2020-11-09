import { TscError } from './types';

const tscErrorLineRegExp = /^(.*)\(\d+,\d+\): error (TS\d{4,}):.*$/;

export const parseTscErrors = (tscOutput: string) => {
  const tscErrors: TscError[] = [];
  const tscOutputLines = tscOutput
    .split('\n')
    .filter((line) => line.trim() !== '');
  let lastTscError: TscError | undefined;

  tscOutputLines.forEach((line) => {
    const errorLineMatch = line.match(tscErrorLineRegExp);

    if (!errorLineMatch) {
      if (lastTscError) {
        lastTscError.rawErrorLines.push(line);
      }
      return;
    }

    const tscError: TscError = {
      filePath: errorLineMatch[1],
      tscErrorCode: errorLineMatch[2],
      rawErrorLines: [line],
    };

    lastTscError = tscError;
    tscErrors.push(tscError);
  });

  return tscErrors;
};
