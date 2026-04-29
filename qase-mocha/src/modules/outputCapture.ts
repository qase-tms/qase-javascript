import { StreamInterceptor } from '../interceptor';

export interface CapturedOutput {
  stdout: string;
  stderr: string;
}

export class OutputCapture {
  private originalStdoutWrite: typeof process.stdout.write | null = null;
  private originalStderrWrite: typeof process.stderr.write | null = null;
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

    const stdoutInterceptor = new StreamInterceptor((data: string) => {
      this.buffer.stdout += data;
    });
    const stderrInterceptor = new StreamInterceptor((data: string) => {
      this.buffer.stderr += data;
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    process.stdout.write = stdoutInterceptor.write.bind(stdoutInterceptor) as typeof process.stdout.write;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    process.stderr.write = stderrInterceptor.write.bind(stderrInterceptor) as typeof process.stderr.write;
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
