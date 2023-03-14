import ErrorStore from './error-store';
import { TscError, TscErrorMatchFlags } from './types';

describe('errorStore', () => {
  it('should push error to proper buckets.', () => {
    const tscError: TscError = {
      filePath: 'path',
      tscErrorCode: 'code',
      rawErrorLines: [],
    };
    const errorStore = new ErrorStore();

    errorStore.pushError(
      tscError,
      TscErrorMatchFlags.errorCode & TscErrorMatchFlags.filePath,
    );
    errorStore.pushError(tscError, TscErrorMatchFlags.errorCode);
    errorStore.pushError(tscError, TscErrorMatchFlags.filePath);
    errorStore.pushError(
      tscError,
      TscErrorMatchFlags.errorCode | TscErrorMatchFlags.filePath,
    );

    expect(errorStore.getAllErrors()).toHaveLength(4);
    expect(errorStore.getIgnoredErrors()).toHaveLength(1);
    expect(errorStore.getReportedErrors()).toHaveLength(3);
    expect(errorStore.getValidErrors()).toHaveLength(2);
    expect(errorStore.getCouldBeIgnoredErrors()).toHaveLength(1);
  });

  it('should reset buckets.', () => {
    const tscError: TscError = {
      filePath: 'path',
      tscErrorCode: 'code',
      rawErrorLines: [],
    };
    const errorStore = new ErrorStore();

    errorStore.pushError(
      tscError,
      TscErrorMatchFlags.errorCode & TscErrorMatchFlags.filePath,
    );
    errorStore.pushError(tscError, TscErrorMatchFlags.errorCode);
    errorStore.pushError(tscError, TscErrorMatchFlags.filePath);
    errorStore.pushError(
      tscError,
      TscErrorMatchFlags.filePath | TscErrorMatchFlags.filePath,
    );

    errorStore.reset();

    expect(errorStore.getAllErrors()).toHaveLength(0);
  });
});
