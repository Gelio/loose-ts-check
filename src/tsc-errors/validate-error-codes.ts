const tscErrorCodeRegExp = /^TS\d{4,}$/;

export const validateTscErrorCodes = (
  tscErrorCodes: ReadonlySet<string>,
): string[] => {
  const validationErrors = Array.from(tscErrorCodes)
    .filter((errorCode) => !tscErrorCodeRegExp.test(errorCode))
    .map((invalidErrorCode) => `Invalid TSC error code: ${invalidErrorCode}`);

  return validationErrors;
};
