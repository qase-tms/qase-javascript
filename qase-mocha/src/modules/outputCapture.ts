export interface CapturedOutput {
  stdout: string;
  stderr: string;
}

type Write = typeof process.stdout.write;

/**
 * Records what a test writes to stdout and stderr for the `captureLogs` attachments. Writes
 * still reach the terminal: the capture copies them, it does not take them over.
 */
export class OutputCapture {
  private originalStdoutWrite: Write | null = null;
  private originalStderrWrite: Write | null = null;
  private buffer: CapturedOutput = { stdout: '', stderr: '' };

  install(): void {
    if (this.originalStdoutWrite || this.originalStderrWrite) {
      // Already installed; preserve existing originals.
      return;
    }

    this.buffer = { stdout: '', stderr: '' };
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.originalStdoutWrite = process.stdout.write;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.originalStderrWrite = process.stderr.write;

    process.stdout.write = this.tee(process.stdout, this.originalStdoutWrite, (data) => {
      this.buffer.stdout += data;
    });
    process.stderr.write = this.tee(process.stderr, this.originalStderrWrite, (data) => {
      this.buffer.stderr += data;
    });
  }

  /** Stops recording but keeps what was recorded for `drain()`. */
  stop(): void {
    this.restore();
  }

  drain(): CapturedOutput {
    this.restore();
    const result = this.buffer;
    this.buffer = { stdout: '', stderr: '' };
    return result;
  }

  reset(): void {
    this.restore();
    this.buffer = { stdout: '', stderr: '' };
  }

  private tee(stream: NodeJS.WriteStream, original: Write, record: (data: string) => void): Write {
    return function (this: unknown, chunk: unknown, ...rest: unknown[]) {
      record(typeof chunk === 'string' ? chunk : Buffer.from(chunk as Uint8Array).toString());
      return (original as (...args: unknown[]) => boolean).call(stream, chunk, ...rest);
    } as Write;
  }

  private restore(): void {
    if (this.originalStdoutWrite) {
      process.stdout.write = this.originalStdoutWrite;
      this.originalStdoutWrite = null;
    }
    if (this.originalStderrWrite) {
      process.stderr.write = this.originalStderrWrite;
      this.originalStderrWrite = null;
    }
  }
}
