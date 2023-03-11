import { writeFileSync } from 'fs';

export const saveJSONFile = (
  path: string,
  value: unknown,
): Error | undefined => {
  try {
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown error while saving JSON.');
  }
};
