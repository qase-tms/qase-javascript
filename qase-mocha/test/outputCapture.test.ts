/* eslint-disable */
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { OutputCapture } from '../src/modules/outputCapture';

describe('OutputCapture', () => {
  let originalStdoutWrite: typeof process.stdout.write;
  let originalStderrWrite: typeof process.stderr.write;
  let capture: OutputCapture;

  beforeEach(() => {
    originalStdoutWrite = process.stdout.write;
    originalStderrWrite = process.stderr.write;
    capture = new OutputCapture();
  });

  afterEach(() => {
    // Safety: always restore the originals between tests.
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  });

  it('install replaces process.stdout.write and process.stderr.write', () => {
    capture.install();
    expect(process.stdout.write).not.toBe(originalStdoutWrite);
    expect(process.stderr.write).not.toBe(originalStderrWrite);
  });

  it('drain() restores originals and returns captured stdout/stderr', () => {
    capture.install();
    process.stdout.write('hello-out');
    process.stderr.write('hello-err');

    const result = capture.drain();

    expect(result).toEqual({ stdout: 'hello-out', stderr: 'hello-err' });
    expect(process.stdout.write).toBe(originalStdoutWrite);
    expect(process.stderr.write).toBe(originalStderrWrite);
  });

  it('without install, drain returns empty strings and is a no-op on streams', () => {
    const result = capture.drain();
    expect(result).toEqual({ stdout: '', stderr: '' });
    expect(process.stdout.write).toBe(originalStdoutWrite);
    expect(process.stderr.write).toBe(originalStderrWrite);
  });

  it('reinstall after drain captures fresh data with no leakage', () => {
    capture.install();
    process.stdout.write('first');
    capture.drain();

    capture.install();
    process.stdout.write('second');
    const result = capture.drain();

    expect(result.stdout).toBe('second');
  });

  it('keeps stdout and stderr separate', () => {
    capture.install();
    process.stdout.write('out1');
    process.stderr.write('err1');
    process.stdout.write('out2');

    const result = capture.drain();

    expect(result.stdout).toBe('out1out2');
    expect(result.stderr).toBe('err1');
  });

  it('reset() restores originals even when drain() was not called', () => {
    capture.install();
    capture.reset();

    expect(process.stdout.write).toBe(originalStdoutWrite);
    expect(process.stderr.write).toBe(originalStderrWrite);
  });
});
