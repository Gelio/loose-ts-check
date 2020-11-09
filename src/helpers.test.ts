import { parseTscErrors, TscError } from './helpers';

describe('parseTscErrors', () => {
  it('should parse a basic error line', () => {
    const filePath = 'app/common/components/card/card.tsx';
    const tscErrorCode = 'TS2722';
    const tscOutput = `${filePath}(94,15): error ${tscErrorCode}: Cannot invoke an object which is possibly 'undefined'.`;

    const result = parseTscErrors(tscOutput);

    expect(result).toHaveLength(1);
    expect(result[0].filePath).toBe(filePath);
    expect(result[0].tscErrorCode).toBe(tscErrorCode);
  });

  it('should parse two errors in the same file', () => {
    const filePath = 'app/common/components/card/card.tsx';
    const tscOutput = `
${filePath}(58,17): error TS2322: Type 'Element | null' is not assignable to type 'ReactElement<any, string | ((props: any) => ReactElement<any, string | ... | (new (props: any) => Component<any, any, any>)> | null) | (new (props: any) => Component<any, any, any>)> | OverlayFunc'.
  Type 'null' is not assignable to type 'ReactElement<any, string | ((props: any) => ReactElement<any, string | ... | (new (props: any) => Component<any, any, any>)> | null) | (new (props: any) => Component<any, any, any>)> | OverlayFunc'.
${filePath}(94,15): error TS2722: Cannot invoke an object which is possibly 'undefined'.`;

    const result = parseTscErrors(tscOutput);

    expect(result).toEqual([
      {
        filePath,
        tscErrorCode: 'TS2322',
      },
      {
        filePath,
        tscErrorCode: 'TS2722',
      },
    ] as TscError[]);
  });

  it('should parse errors from various files', () => {
    const errorLine = `
app/pages/site/site-manifest/site-manifest.tsx(26,11): error TS2322: Type 'REQUEST_STATUSES | undefined' is not assignable to type 'REQUEST_STATUSES'.
  Type 'undefined' is not assignable to type 'REQUEST_STATUSES'.
app/pages/site/site-pipelines/new.ts(1,45): error TS2532: Object is possibly 'undefined'.
app/pages/site/site-tests/site-tests.tsx(33,19): error TS2322: Type 'REQUEST_STATUSES | undefined' is not assignable to type 'REQUEST_STATUSES'.
  Type 'undefined' is not assignable to type 'REQUEST_STATUSES'.`;

    const result = parseTscErrors(errorLine);

    expect(result).toHaveLength(3);
  });

  it('should handle an empty input', () => {
    const tscOutput = Array.from({ length: 5 }).join('\n');

    const result = parseTscErrors(tscOutput);

    expect(result).toHaveLength(0);
  });
});
