import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface TscError {
  filePath: string;
  tscErrorCode: string;
}

export const parseTscErrors = (tscOutput: string) => {
  const tsErrorCodeRegexp = /TS\d{4,}/;

  const linesWithErrors = tscOutput
    .split('\n')
    .filter((line) => tsErrorCodeRegexp.test(line));

  const errorLineRegExp = /^(?<filePath>.*)\(\d+,\d+\): error (?<tsErrorCode>TS\d{4,}):.*$/;

  return linesWithErrors.map(
    (line): TscError => {
      const errorLineMatch = line.match(errorLineRegExp);

      if (!errorLineMatch) {
        throw new Error(
          `Line was mistakingly caught as a TS error, but it does not match the line-parsing regexp:\n${line}`,
        );
      }

      if (!errorLineMatch.groups) {
        throw new Error('Regexp capture groups are not supported');
      }

      return {
        filePath: errorLineMatch.groups.filePath,
        tscErrorCode: errorLineMatch.groups.tsErrorCode,
      };
    },
  );
};

export const readJSONFile = (path: string) => {
  const fileContent = readFileSync(path, { encoding: 'utf-8' });

  return JSON.parse(fileContent);
};

export const saveJSONFile = (path: string, value: any) => {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

export const getLooselyTypeCheckedFilePaths = (registryPath: string) => {
  try {
    const result: string[] = readJSONFile(registryPath);

    return new Set(result);
  } catch (error) {
    console.error(`Cannot parse ${registryPath}`, error);
    process.exit(1);
  }
};

export const runTsc = (tsconfigPath: string) =>
  spawnSync('npm', ['run', 'lint:types', '--', '-p', tsconfigPath], {
    cwd: join(__dirname, '..'),
    encoding: 'utf-8',
  });

export const getOrangeText = (text: string | number) =>
  `\x1b[33m${text}\x1b[0m`;
