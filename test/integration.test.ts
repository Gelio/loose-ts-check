import { exec } from 'child_process';
import { join } from 'path';
import { access, constants as fsConstants, rm, cp } from 'fs/promises';

function runCommand(command: string, { cwd }: { cwd: string }) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(
          new Error(
            `Command "${command}" failed (exit code ${error.code}).\nStdout: ${stdout}\n\nStderr: ${stderr}`,
          ),
        );
      } else {
        resolve(undefined);
      }
    });
  });
}

function fileExists(file: string) {
  return access(file, fsConstants.F_OK)
    .then(() => true)
    .catch(() => false);
}

const looseTsCheckBinaryPath = join(process.cwd(), 'bin', 'loose-ts-check');

const tsVersions = ['3.9', '4.0', '4.4', '4.9', 'latest'];

async function prepareTestDirectory({
  tsVersion,
  testDirPath,
  testSourceDirPath,
}: {
  testSourceDirPath: string;
  testDirPath: string;
  tsVersion: string;
}) {
  if (await fileExists(testDirPath)) {
    await rm(testDirPath, { recursive: true });
  }
  await cp(testSourceDirPath, testDirPath, { recursive: true });
  await runCommand('npm init -y', { cwd: testDirPath });
  await runCommand(`npm install typescript@${tsVersion} -D`, {
    cwd: testDirPath,
  });
}

async function diffExpectedConfigFiles(testDirPath: string) {
  await runCommand(
    'diff expected-ignored-error-codes.json ignored-error-codes.json',
    { cwd: testDirPath },
  );
  await runCommand(
    'diff expected-loosely-type-checked-files.json loosely-type-checked-files.json',
    { cwd: testDirPath },
  );
}

jest.setTimeout(10_000);

for (const tsVersion of tsVersions) {
  test(`init works with TS ${tsVersion}`, async () => {
    const initDirName = join(__dirname, 'init');
    const testDirPath = join(__dirname, 'runs', `init-${tsVersion}`);
    await prepareTestDirectory({
      testSourceDirPath: initDirName,
      testDirPath,
      tsVersion,
    });

    await runCommand(
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckBinaryPath} --init`,
      { cwd: testDirPath },
    );

    await diffExpectedConfigFiles(testDirPath);
  });

  test(`auto-update works with TS ${tsVersion}`, async () => {
    const initDirName = join(__dirname, 'auto-update');
    const testDirPath = join(__dirname, 'runs', `auto-update-${tsVersion}`);
    await prepareTestDirectory({
      testSourceDirPath: initDirName,
      testDirPath,
      tsVersion,
    });

    await runCommand(
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckBinaryPath} --auto-update`,
      { cwd: testDirPath },
    );

    await diffExpectedConfigFiles(testDirPath);
  });
}
