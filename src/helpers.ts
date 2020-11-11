import { readFileSync } from 'fs';
import { createInterface } from 'readline';

export const readJSONArray = (
  path: string,
  ignoreMissingFile: boolean,
): any[] | Error => {
  let fileContent: string;

  try {
    fileContent = readFileSync(path, { encoding: 'utf-8' });
  } catch (error) {
    if (ignoreMissingFile) {
      return [];
    }

    return new Error(`Cannot read file ${path}: ${error.message}`);
  }

  let parsedFile: unknown;
  try {
    parsedFile = JSON.parse(fileContent);
  } catch (error) {
    return new Error(`Cannot parse JSON file ${path}: ${error.message}`);
  }

  if (!Array.isArray(parsedFile)) {
    return new Error(`File ${path} is not a valid array`);
  }

  return parsedFile;
};

export const getProgramInput = () =>
  new Promise<string[]>((resolve) => {
    const programInput: string[] = [];
    const rl = createInterface(process.stdin);

    rl.on('line', (line) => {
      programInput.push(line);
    });

    rl.once('close', () => {
      resolve(programInput);
    });
  });
