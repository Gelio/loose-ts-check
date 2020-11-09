import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
