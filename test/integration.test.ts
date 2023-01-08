import { exec, ExecException } from 'child_process';
import { join } from 'path';
import { access, constants as fsConstants, rm, cp } from 'fs/promises';

function runCommand(command: string, { cwd }: { cwd: string }) {
  return new Promise<{
    error: ExecException | null;
    stdout: string;
    stderr: string;
  }>((resolve) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

async function runCommandExpectSuccess(...args: Parameters<typeof runCommand>) {
  const { error, stdout, stderr } = await runCommand(...args);

  if (error) {
    throw new Error(
      `Command "${args[0]}" failed (exit code ${error.code}).\n\nStdout:\n${stdout}\n\nStderr:\n${stderr}`,
    );
  }
}

function fileExists(file: string) {
  return access(file, fsConstants.F_OK)
    .then(() => true)
    .catch(() => false);
}

function getTestDirPaths({
  testDirName,
  tsVersion,
}: {
  testDirName: string;
  tsVersion: string;
}) {
  return {
    testSourceDirPath: join(__dirname, testDirName),
    testDirPath: join(__dirname, 'runs', `${testDirName}-${tsVersion}`),
  };
}

const looseTsCheckBinaryPath = join(process.cwd(), 'bin', 'loose-ts-check');
const looseTsCheckCommand = `FORCE_COLOR=0 ${looseTsCheckBinaryPath}`;

const tsVersions = process.env.ONLY_LATEST_VERSION
  ? ['latest']
  : ['3.9', '4.0', '4.4', '4.9', 'latest'];

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
  await runCommandExpectSuccess('npm init -y', { cwd: testDirPath });
  await runCommandExpectSuccess(`npm install typescript@${tsVersion} -D`, {
    cwd: testDirPath,
  });
}

async function diffExpectedConfigFiles(testDirPath: string) {
  await runCommandExpectSuccess(
    'diff expected-ignored-error-codes.json ignored-error-codes.json',
    { cwd: testDirPath },
  );
  await runCommandExpectSuccess(
    'diff expected-loosely-type-checked-files.json loosely-type-checked-files.json',
    { cwd: testDirPath },
  );
}

jest.setTimeout(10_000);

for (const tsVersion of tsVersions) {
  test(`init works with TS ${tsVersion}`, async () => {
    const { testSourceDirPath, testDirPath } = getTestDirPaths({
      testDirName: 'init',
      tsVersion,
    });
    await prepareTestDirectory({
      testSourceDirPath,
      testDirPath,
      tsVersion,
    });

    await runCommandExpectSuccess(
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckCommand} --init`,
      { cwd: testDirPath },
    );

    await diffExpectedConfigFiles(testDirPath);
  });

  test(`auto-update works with TS ${tsVersion}`, async () => {
    const { testSourceDirPath, testDirPath } = getTestDirPaths({
      testDirName: 'auto-update',
      tsVersion,
    });
    await prepareTestDirectory({
      testSourceDirPath,
      testDirPath,
      tsVersion,
    });

    await runCommandExpectSuccess(
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckCommand} --auto-update`,
      { cwd: testDirPath },
    );

    await diffExpectedConfigFiles(testDirPath);
  });

  test(`"check-successful" works with TS ${tsVersion}`, async () => {
    const { testSourceDirPath, testDirPath } = getTestDirPaths({
      testDirName: 'check-successful',
      tsVersion,
    });
    await prepareTestDirectory({
      testSourceDirPath,
      testDirPath,
      tsVersion,
    });

    await runCommandExpectSuccess(
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckCommand}`,
      { cwd: testDirPath },
    );
  });

  test(`"check-successful" works with TS ${tsVersion}`, async () => {
    const initDirName = join(__dirname, 'check-successful');
    const testDirPath = join(
      __dirname,
      'runs',
      `check-successful-${tsVersion}`,
    );
    await prepareTestDirectory({
      testSourceDirPath: initDirName,
      testDirPath,
      tsVersion,
    });

    await runCommandExpectSuccess(
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckCommand}`,
      { cwd: testDirPath },
    );
  });

  test(`"check-failed" works with TS ${tsVersion}`, async () => {
    const { testSourceDirPath, testDirPath } = getTestDirPaths({
      testDirName: 'check-failed',
      tsVersion,
    });
    await prepareTestDirectory({
      testSourceDirPath,
      testDirPath,
      tsVersion,
    });

    const { error, stdout } = await runCommand(
      // TODO: do not use pipe so tests can run on Windows too
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckCommand}`,
      { cwd: testDirPath },
    );
    expect(error).toBeDefined();
    expect(error?.code).toBe(1);
    expect(stdout).toEqual(
      expect.stringContaining("Property 'someMethod' does not exist"),
    );
    expect(stdout).toEqual(
      expect.stringContaining('1 currently ignored error codes did not occur'),
    );
  });

  test(`"wildcard-paths-check" works with TS ${tsVersion}`, async () => {
    const { testSourceDirPath, testDirPath } = getTestDirPaths({
      testDirName: 'wildcard-paths-check',
      tsVersion,
    });
    await prepareTestDirectory({
      testSourceDirPath,
      testDirPath,
      tsVersion,
    });

    await runCommandExpectSuccess(
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckCommand}`,
      { cwd: testDirPath },
    );
  });

  test(`"wildcard-paths-auto-update" works with TS ${tsVersion}`, async () => {
    const { testSourceDirPath, testDirPath } = getTestDirPaths({
      testDirName: 'wildcard-paths-auto-update',
      tsVersion,
    });
    await prepareTestDirectory({
      testSourceDirPath,
      testDirPath,
      tsVersion,
    });

    await runCommandExpectSuccess(
      `./node_modules/.bin/tsc --noEmit | ${looseTsCheckCommand} --auto-update`,
      { cwd: testDirPath },
    );

    await diffExpectedConfigFiles(testDirPath);
  });
}
