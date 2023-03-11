import { FilePathMatcher } from '../file-path-matcher';
import processCompilationResults, {
  ProcessCompilateResultsInput,
} from '../process-compilation-results';
import classifyTscError from '../tsc-errors/classify-tsc-error';
import { parseTscLine } from '../tsc-errors/parse-tsc-line';
import { TscError } from '../tsc-errors/types';
import { validateTscErrorCodes } from '../tsc-errors/validate-error-codes';
import { CliDependencies } from './cli-dependencies';
import { readConfig } from './config/read-config';
import WatchModeSpy from '../watch-mode-spy';
import ErrorStore from '../tsc-errors/error-store';

export class Program {
  private readonly cliDependencies: CliDependencies;
  private readonly errorStore = new ErrorStore();
  private readonly watchModeSpy = new WatchModeSpy();
  private lastTscError: TscError | undefined;
  private looselyTypeCheckedFilePathsArray: string[];
  private looselyTypeCheckedFilePathMatcher: FilePathMatcher;
  private ignoredErrorCodes: ReadonlySet<string>;

  constructor(cliDependencies: CliDependencies) {
    this.cliDependencies = cliDependencies;
    const configResources = this.buildConfigResources();
    this.looselyTypeCheckedFilePathsArray =
      configResources.looselyTypeCheckedFilePathsArray;
    this.looselyTypeCheckedFilePathMatcher =
      configResources.looselyTypeCheckedFilePathMatcher;
    this.ignoredErrorCodes = configResources.ignoredErrorCodes;
  }

  private buildConfigResources(): {
    looselyTypeCheckedFilePathsArray: string[];
    looselyTypeCheckedFilePathMatcher: FilePathMatcher;
    ignoredErrorCodes: ReadonlySet<string>;
  } {
    const readResult = readConfig(this.cliDependencies);
    if (!readResult) {
      throw new Error();
    }

    const { ignoredErrorCodesArray, looselyTypeCheckedFilePathsArray } =
      readResult;

    const ignoredErrorCodes = new Set<string>(ignoredErrorCodesArray);

    const validationErrors = validateTscErrorCodes(ignoredErrorCodes);

    if (validationErrors.length > 0) {
      this.cliDependencies.log(
        `Invalid TSC error codes in ${this.cliDependencies.cliOptions['ignored-error-codes']}`,
      );
      validationErrors.forEach(this.cliDependencies.log);
      throw new Error();
    }

    const looselyTypeCheckedFilePathMatcher = new FilePathMatcher(
      looselyTypeCheckedFilePathsArray,
    );

    return {
      looselyTypeCheckedFilePathsArray,
      looselyTypeCheckedFilePathMatcher,
      ignoredErrorCodes,
    };
  }

  private buildCompilationResultsInput(): ProcessCompilateResultsInput {
    return {
      cliDependencies: this.cliDependencies,
      looselyTypeCheckedFilePathsArray: this.looselyTypeCheckedFilePathsArray,
      looselyTypeCheckedFilePathMatcher: this.looselyTypeCheckedFilePathMatcher,
      ignoredErrorCodes: this.ignoredErrorCodes,
      tscErrors: this.errorStore.getAllErrors(),
      ignoredTscErrors: this.errorStore.getIgnoredErrors(),
      reportedTscErrors: this.errorStore.getReportedErrors(),
      validTscErrors: this.errorStore.getValidErrors(),
      tscErrorsThatCouldBeIgnored: this.errorStore.getCouldBeIgnoredErrors(),
    };
  }

  public processLine(line: string): void {
    if (this.watchModeSpy.detectWatchModeCompilationStartOutput(line)) {
      this.cliDependencies.log(
        this.watchModeSpy.watchModeCompilationStartOuput,
      );
      return;
    }

    if (this.watchModeSpy.detectWatchModeCompilationFinishedOutput(line)) {
      const compilationResultsInput = this.buildCompilationResultsInput();
      processCompilationResults(compilationResultsInput);
      this.cliDependencies.log(this.watchModeSpy.watchModeCompilationEndOutput);
      return;
    }

    if (this.watchModeSpy.detectWatchModeFileChangeDetectedOutput(line)) {
      this.cliDependencies.log(
        this.watchModeSpy.watchModeFileChangeDetectedOutput,
      );

      this.lastTscError = undefined;
      this.errorStore.reset();
    }

    const tscError = parseTscLine(line, this.lastTscError);

    if (tscError !== this.lastTscError) {
      const errorClassification = classifyTscError(
        tscError as TscError,
        this.ignoredErrorCodes,
        this.looselyTypeCheckedFilePathMatcher,
      );

      this.errorStore.pushError(tscError as TscError, errorClassification);
    }

    this.lastTscError = tscError;
  }

  public finish(): { error: boolean } | undefined {
    if (!this.watchModeSpy.watchModeDetected()) {
      const compilationResultsInput = this.buildCompilationResultsInput();
      return processCompilationResults(compilationResultsInput);
    }
  }
}
