import { Writable } from 'stream';

export interface TestOutput {
  stdout: string;
  stderr: string;
}

export class StreamInterceptor extends Writable {
  private readonly onWrite: (data: string) => void;

  constructor(onWriteCallback: (data: string) => void) {
    super();
    this.onWrite = onWriteCallback;
  }

  override _write(chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-call
    this.onWrite(chunk.toString());
    callback();
  }
}
