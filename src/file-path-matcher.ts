import { Minimatch } from 'minimatch';
import invariant from 'ts-invariant';

export class FilePathMatcher {
  private readonly filePathMatchCountMap: Map<string, number>;
  private readonly regularFilePaths: Set<string> = new Set();
  private readonly patternMatchersMap: Map<
    string,
    (filePath: string) => boolean
  > = new Map();

  constructor(filePaths: string[]) {
    this.filePathMatchCountMap = new Map(
      filePaths.map((filePath) => [filePath, 0]),
    );

    for (const filePath of filePaths) {
      // NOTE: different handling of paths is an optimization.
      // Having regular full file paths in a set lets us
      // check if a path matches any path in the set using O(1)
      // instead of O(n).
      // We only need to go through the patterns using O(n).
      if (containsMagicCharacters(filePath)) {
        const m = new Minimatch(filePath);
        this.patternMatchersMap.set(filePath, m.match.bind(m));
      } else {
        this.regularFilePaths.add(filePath);
      }
    }
  }

  public matches(filePath: string) {
    const matchesRegularFilePath = this.regularFilePaths.has(filePath);
    if (matchesRegularFilePath) {
      const previousMatchesCount = this.filePathMatchCountMap.get(filePath);
      invariant(
        typeof previousMatchesCount === 'number',
        `File path ${filePath} is in the regular file paths set but not in the match count map`,
      );
      this.filePathMatchCountMap.set(filePath, previousMatchesCount + 1);
    }

    // NOTE: we need to go through all the matches anyway to check
    // if they match some files. This is necessary so we do not assume
    // these wildcard matches are useless when they matched files that
    // are also matched by regular full paths to these files.

    let somePatternMatched = false;
    for (const [pattern, patternMatches] of this.patternMatchersMap.entries()) {
      if (patternMatches(filePath)) {
        somePatternMatched = true;

        const previousMatchesCount = this.filePathMatchCountMap.get(pattern);
        invariant(
          typeof previousMatchesCount === 'number',
          `Pttern ${pattern} is not in the match count map`,
        );
        this.filePathMatchCountMap.set(pattern, previousMatchesCount + 1);
      }
    }

    return matchesRegularFilePath || somePatternMatched;
  }

  public getUnusedFilePaths() {
    return Array.from(this.filePathMatchCountMap.entries())
      .filter(([_name, matchesCount]) => matchesCount === 0)
      .map(([name]) => name);
  }
}

function containsMagicCharacters(filePath: string): boolean {
  // NOTE: magic characters interpreted by minimatch
  // @see https://www.npmjs.com/package/minimatch
  return /[\{\}\?\*]/.test(filePath);
}
