class WatchModeSpy {
  public readonly watchModeCompilationStartOuput =
    'Starting compilation in watch mode...';
  private readonly watchModeCompilationStartOuputRegExp = new RegExp(
    this.watchModeCompilationStartOuput,
  );
  public readonly watchModeCompilationEndOutput = 'Watching for file changes.';
  private readonly watchModeCompilationEndOutputRegExp = new RegExp(
    this.watchModeCompilationEndOutput,
  );
  public readonly watchModeFileChangeDetectedOutput =
    'File change detected. Starting incremental compilation...';
  private readonly watchModeFileChangeDetectedOutputRegExp = new RegExp(
    this.watchModeFileChangeDetectedOutput,
  );

  private watchModeCompilationStarted = false;

  public watchModeDetected(): boolean {
    return this.watchModeCompilationStarted;
  }

  public detectWatchModeCompilationStartOutput(tscOutputLine: string): boolean {
    if (
      !this.watchModeCompilationStarted &&
      this.watchModeCompilationStartOuputRegExp.test(tscOutputLine)
    ) {
      this.watchModeCompilationStarted = true;
      return true;
    } else {
      return false;
    }
  }

  public detectWatchModeCompilationFinishedOutput(
    tscOutputLine: string,
  ): boolean {
    if (
      this.watchModeCompilationStarted &&
      this.watchModeCompilationEndOutputRegExp.test(tscOutputLine)
    ) {
      return true;
    } else {
      return false;
    }
  }

  public detectWatchModeFileChangeDetectedOutput(
    tscOutputLine: string,
  ): boolean {
    if (
      this.watchModeCompilationStarted &&
      this.watchModeFileChangeDetectedOutputRegExp.test(tscOutputLine)
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export default WatchModeSpy;
