import { parseTscLine } from './parse-tsc-line';
import { TscError } from './types';

describe('parseTscLine', () => {
  it('should parse a basic error line', () => {
    const filePath = 'app/common/components/card/card.tsx';
    const tscErrorCode = 'TS2722';
    const tscOutputLine = `${filePath}(94,15): error ${tscErrorCode}: Cannot invoke an object which is possibly 'undefined'.`;
    const result = parseTscLine(tscOutputLine);

    expect(result).toBeTruthy();
    expect(result?.filePath).toBe(filePath);
    expect(result?.tscErrorCode).toBe(tscErrorCode);
    expect(result?.rawErrorLines).toContain(tscOutputLine);
  });

  it('should handle an empty input', () => {
    const tscOutputLine = '';
    const result = parseTscLine(tscOutputLine);
    expect(result).toBeUndefined();
  });

  it('should not add final whitespace to rawErrorLines', () => {
    const tscOutputLines =
      `app/common/components/card/card.tsx(94,15): error TS2722: Cannot invoke an object which is possibly 'undefined'.



    `.split('\n');

    let tscError: TscError | undefined;
    for (let tscOutputLine of tscOutputLines) {
      tscError = parseTscLine(tscOutputLine, tscError);
    }

    expect(tscError?.rawErrorLines).toEqual([
      "app/common/components/card/card.tsx(94,15): error TS2722: Cannot invoke an object which is possibly 'undefined'.",
    ]);
  });
});
