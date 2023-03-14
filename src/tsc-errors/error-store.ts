import { TscError, TscErrorMatchFlags } from './types';

class ErrorStore {
  private tscErrors: Map<TscErrorMatchFlags, TscError[]> = new Map();

  public getAllErrors(): TscError[] {
    return [...this.tscErrors.values()].flat();
  }

  public getIgnoredErrors(): TscError[] {
    const key = TscErrorMatchFlags.errorCode | TscErrorMatchFlags.filePath;
    return this.tscErrors.get(key) || [];
  }

  public getReportedErrors(): TscError[] {
    const keys = [
      TscErrorMatchFlags.errorCode & TscErrorMatchFlags.filePath,
      TscErrorMatchFlags.errorCode,
      TscErrorMatchFlags.filePath,
    ];
    const errors: TscError[] = [];
    for (let key of keys) {
      const values = this.tscErrors.get(key) || [];
      errors.push(...values);
    }
    return errors;
  }

  public getValidErrors(): TscError[] {
    const keys = [
      TscErrorMatchFlags.errorCode & TscErrorMatchFlags.filePath,
      TscErrorMatchFlags.filePath,
    ];
    const errors: TscError[] = [];
    for (let key of keys) {
      const values = this.tscErrors.get(key) || [];
      errors.push(...values);
    }
    return errors;
  }

  public getCouldBeIgnoredErrors(): TscError[] {
    const key = TscErrorMatchFlags.errorCode;
    return this.tscErrors.get(key) || [];
  }

  public pushError(error: TscError, errorMatchFlags: TscErrorMatchFlags): void {
    this.tscErrors.get(errorMatchFlags)?.push(error) ||
      this.tscErrors.set(errorMatchFlags, [error]);
  }

  public reset(): void {
    this.tscErrors.clear();
  }
}

export default ErrorStore;
