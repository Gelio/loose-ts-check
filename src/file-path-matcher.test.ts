import { FilePathMatcher } from './file-path-matcher';

interface MatchTestCase {
  matchingFilePaths: string[];
  /** File paths which did not match the {@link filePathToTest} */
  unusedFilePaths: string[];
  filePathToTest: string;
  expectedResult: boolean;
}

const matchTestCases: MatchTestCase[] = [
  {
    matchingFilePaths: ['src/test.ts', 'unused-path'],
    unusedFilePaths: ['unused-path'],
    filePathToTest: 'src/test.ts',
    expectedResult: true,
  },
  {
    matchingFilePaths: ['unused-path', 'src/**', '**', 'src/test.ts'],
    unusedFilePaths: ['unused-path'],
    filePathToTest: 'src/test.ts',
    expectedResult: true,
  },
  {
    matchingFilePaths: ['src/**/*'],
    unusedFilePaths: [],
    filePathToTest: 'src/test.ts',
    expectedResult: true,
  },
  {
    matchingFilePaths: [
      'unused-path',
      'src/**/*',
      '**/*-path.ts',
      'src/test.ts',
    ],
    unusedFilePaths: ['unused-path', 'src/**/*', 'src/test.ts'],
    filePathToTest: 'some-path.ts',
    expectedResult: true,
  },
  {
    matchingFilePaths: ['unused-path', 'src/**', '**/*-path.ts', 'src/test.ts'],
    unusedFilePaths: ['unused-path', 'src/**', '**/*-path.ts', 'src/test.ts'],
    filePathToTest: 'some-path.md',
    expectedResult: false,
  },
];

describe('matches file paths', () => {
  for (const {
    expectedResult,
    filePathToTest,
    matchingFilePaths,
  } of matchTestCases) {
    it(`${filePathToTest} ${
      expectedResult ? 'matches' : 'does not match'
    } [${matchingFilePaths.join(', ')}]`, () => {
      const matcher = new FilePathMatcher(matchingFilePaths);
      expect(matcher.matches(filePathToTest)).toEqual(expectedResult);
    });
  }
});

describe('determines unused file paths', () => {
  for (const {
    unusedFilePaths,
    filePathToTest,
    matchingFilePaths,
  } of matchTestCases) {
    it(`[${unusedFilePaths.join(
      ', ',
    )}] are unused from ${matchingFilePaths.join(
      ', ',
    )} after matching [${filePathToTest}]`, () => {
      const matcher = new FilePathMatcher(matchingFilePaths);
      matcher.matches(filePathToTest);

      expect(matcher.getUnusedFilePaths()).toEqual(unusedFilePaths);
    });
  }
});
