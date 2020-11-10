import { validateTscErrorCodes } from './validate-error-codes';

describe('validateTscErrorCodes', () => {
  it('should return error messages for invalid TSC errors', () => {
    const invalidErrorCodes = ['invalid error code', 'TSC1234', 'TS1'];
    const tscErrors = new Set(['TS1234', ...invalidErrorCodes]);

    const result = validateTscErrorCodes(tscErrors);

    invalidErrorCodes.forEach((invalidErrorCode) => {
      expect(result).toContainEqual(expect.stringContaining(invalidErrorCode));
    });
  });

  it('should return an empty array when all error codes are valid', () => {
    const result = validateTscErrorCodes(new Set(['TS1234']));

    expect(result).toHaveLength(0);
  });
});
