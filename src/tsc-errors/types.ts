export interface TscError {
  filePath: string;
  tscErrorCode: string;
  rawErrorLines: string[];
}

export enum TscErrorMatchFlags {
  filePath = 1 << 0,
  errorCode = 1 << 1,
}
