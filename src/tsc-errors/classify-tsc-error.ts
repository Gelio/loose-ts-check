import { FilePathMatcher } from '../file-path-matcher';
import { TscError, TscErrorMatchFlags } from './types';

const classifyTscError = (
  tscError: TscError,
  ignoredErrorCodesSet: ReadonlySet<string>,
  filePathMatcher: FilePathMatcher,
): TscErrorMatchFlags => {
  const errorCodeMatch = ignoredErrorCodesSet.has(tscError.tscErrorCode);
  const filePathMatch = filePathMatcher.matches(tscError.filePath);

  let matchFlags = TscErrorMatchFlags.filePath & TscErrorMatchFlags.errorCode;

  if (errorCodeMatch) {
    matchFlags |= TscErrorMatchFlags.errorCode;
  }

  if (filePathMatch) {
    matchFlags |= TscErrorMatchFlags.filePath;
  }

  return matchFlags;
};

export default classifyTscError;
