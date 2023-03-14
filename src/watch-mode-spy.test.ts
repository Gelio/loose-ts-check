import WatchModeSpy from './watch-mode-spy';

describe('watchModeSpy', () => {
  it('should return true, when ingesting watch mode compilation start output', () => {
    const watchModeSpy = new WatchModeSpy();
    const result = watchModeSpy.detectWatchModeCompilationStartOutput(
      watchModeSpy.watchModeCompilationStartOuput,
    );
    expect(result).toBe(true);
  });

  it('should return false, when ingesting watch mode compilation finish output but watch mode has not started', () => {
    const watchModeSpy = new WatchModeSpy();
    const result = watchModeSpy.detectWatchModeCompilationFinishedOutput(
      watchModeSpy.watchModeCompilationEndOutput,
    );
    expect(result).toBe(false);
  });

  it('should return true, when ingesting watch mode compilation finish output and watch mode started', () => {
    const watchModeSpy = new WatchModeSpy();
    watchModeSpy.detectWatchModeCompilationStartOutput(
      watchModeSpy.watchModeCompilationStartOuput,
    );
    const result = watchModeSpy.detectWatchModeCompilationFinishedOutput(
      watchModeSpy.watchModeCompilationEndOutput,
    );
    expect(result).toBe(true);
  });

  it('should return false, when ingesting watch mode watching for changes output but watch mode not started', () => {
    const watchModeSpy = new WatchModeSpy();
    const result = watchModeSpy.detectWatchModeFileChangeDetectedOutput(
      watchModeSpy.watchModeFileChangeDetectedOutput,
    );
    expect(result).toBe(false);
  });

  it('should return true, when ingesting watch mode watching for changes output and watch mode started', () => {
    const watchModeSpy = new WatchModeSpy();
    watchModeSpy.detectWatchModeCompilationStartOutput(
      watchModeSpy.watchModeCompilationStartOuput,
    );
    const result = watchModeSpy.detectWatchModeFileChangeDetectedOutput(
      watchModeSpy.watchModeFileChangeDetectedOutput,
    );
    expect(result).toBe(true);
  });

  it('should return false, when ingesting any other output', () => {
    const unrelatedOutput = 'This should not be detected as true';
    const watchModeSpy = new WatchModeSpy();

    const detectedStart =
      watchModeSpy.detectWatchModeCompilationStartOutput(unrelatedOutput);
    const detectedFinish =
      watchModeSpy.detectWatchModeCompilationFinishedOutput(unrelatedOutput);
    const detectedChange =
      watchModeSpy.detectWatchModeFileChangeDetectedOutput(unrelatedOutput);

    expect(detectedStart).toBe(false);
    expect(detectedFinish).toBe(false);
    expect(detectedChange).toBe(false);
  });
});
