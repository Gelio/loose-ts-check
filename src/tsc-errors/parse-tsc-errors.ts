import { TscError } from './types';

const tscErrorLineRegExp = /^(.*)(?:\(\d+,\d+\):|:\d+:\d+ -) error (TS\d{4,}):.*$/;
const stripAnsiRegExp = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export const parseTscErrors = (tscOutput: string[]) => {
  const tscErrors: TscError[] = [];
  const tscOutputLines = tscOutput.map((line) => line.replace(stripAnsiRegExp, '').trim()).filter((line) => line);
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
