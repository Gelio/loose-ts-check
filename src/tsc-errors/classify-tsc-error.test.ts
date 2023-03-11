import { FilePathMatcher } from '../file-path-matcher';
import classifyTscError from './classify-tsc-error';
import { TscError, TscErrorMatchFlags } from './types';

describe('classifyTscError', () => {
  it('should properly classify an ignored error.', () => {
    const filePath = '/a/file/path.ts';
    const errorCode = 'TS1234';
    const tscError: TscError = {
      filePath: filePath,
      tscErrorCode: errorCode,
      rawErrorLines: [],
    };
    const filePathMatcher = new FilePathMatcher([filePath]);
    const ignoredErrorCodes = new Set<string>([errorCode]);
    const errorClassification = classifyTscError(
      tscError,
      ignoredErrorCodes,
      filePathMatcher,
    );

    expect(errorClassification).toBe(
      TscErrorMatchFlags.errorCode | TscErrorMatchFlags.filePath,
    );
  });

  it('should properly classify a valid error with error code and file path misses.', () => {
    const errorFilePath = '/a/file/path.ts';
    const errorCode = 'TS1234';
    const tscError: TscError = {
      filePath: errorFilePath,
      tscErrorCode: errorCode,
      rawErrorLines: [],
    };
    const filePathToIgnore = '/a/different/file/path.ts';
    const errorToIgnore = 'TS5678';
    const filePathMatcher = new FilePathMatcher([filePathToIgnore]);
    const ignoredErrorCodes = new Set<string>([errorToIgnore]);
    const errorClassification = classifyTscError(
      tscError,
      ignoredErrorCodes,
      filePathMatcher,
    );

    expect(errorClassification).toBe(
      TscErrorMatchFlags.errorCode & TscErrorMatchFlags.filePath,
    );
  });

  it('should properly classify a valid error with error code miss and file path hit.', () => {
    const errorFilePath = '/a/file/path.ts';
    const errorCode = 'TS1234';
    const tscError: TscError = {
      filePath: errorFilePath,
      tscErrorCode: errorCode,
      rawErrorLines: [],
    };
    const errorToIgnore = 'TS5678';
    const filePathMatcher = new FilePathMatcher([errorFilePath]);
    const ignoredErrorCodes = new Set<string>([errorToIgnore]);
    const errorClassification = classifyTscError(
      tscError,
      ignoredErrorCodes,
      filePathMatcher,
    );

    expect(errorClassification).toBe(TscErrorMatchFlags.filePath);
  });

  it('should properly classify an error that could be ignored.', () => {
    const errorFilePath = '/a/file/path.ts';
    const errorCode = 'TS1234';
    const tscError: TscError = {
      filePath: errorFilePath,
      tscErrorCode: errorCode,
      rawErrorLines: [],
    };
    const filePathToIgnore = '/a/different/file/path.ts';
    const filePathMatcher = new FilePathMatcher([filePathToIgnore]);
    const ignoredErrorCodes = new Set<string>([errorCode]);
    const errorClassification = classifyTscError(
      tscError,
      ignoredErrorCodes,
      filePathMatcher,
    );

    expect(errorClassification).toBe(TscErrorMatchFlags.errorCode);
  });
});
