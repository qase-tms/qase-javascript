/* eslint-disable */
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as ts from 'typescript';
import { PlaywrightQaseReporter, PlaywrightQaseOptionsType } from '../src/reporter';

jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual<typeof import('qase-javascript-commons')>('qase-javascript-commons');
  return {
    ...actual,
    QaseReporter: {
      getInstance: jest.fn(() => ({ isCaptureLogs: () => false })),
    },
  };
});

const loaderWith = (config: unknown) => ({ load: () => config }) as any;

describe('PlaywrightQaseReporter framework options', () => {
  // ts-jest runs with isolatedModules (no type-checking), so the type contract is checked with tsc here.
  it('types `framework` as optional', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qase-pw-types-'));
    const file = path.join(dir, 'contract.ts');
    const reporterModule = path.join(__dirname, '..', 'src', 'reporter').replace(/\\/g, '/');
    fs.writeFileSync(
      file,
      `import { PlaywrightQaseOptionsType } from '${reporterModule}';\nexport const o: PlaywrightQaseOptionsType = {};\n`,
    );
    try {
      const program = ts.createProgram([file], {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      });
      const messages = ts
        .getPreEmitDiagnostics(program)
        .filter((d) => d.file?.fileName === file)
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
      expect(messages).toEqual([]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('accepts options without `framework` at runtime', () => {
    expect(() => new PlaywrightQaseReporter({}, loaderWith(null))).not.toThrow();
  });

  it('takes framework.playwright settings from the config file', () => {
    const reporter = new PlaywrightQaseReporter(
      {} as PlaywrightQaseOptionsType,
      loaderWith({
        framework: {
          playwright: {
            browser: { addAsParameter: true, parameterName: 'Browser' },
            markAsFlaky: true,
          },
        },
      }),
    );

    expect(reporter['options']).toEqual({
      browser: { addAsParameter: true, parameterName: 'Browser' },
      markAsFlaky: true,
    });
  });

  it('lets inline reporter options override the config file key by key', () => {
    const reporter = new PlaywrightQaseReporter(
      { framework: { browser: { parameterName: 'Inline' }, markAsFlaky: false } } as PlaywrightQaseOptionsType,
      loaderWith({
        framework: {
          playwright: {
            browser: { addAsParameter: true, parameterName: 'File' },
            markAsFlaky: true,
          },
        },
      }),
    );

    expect(reporter['options']).toEqual({
      browser: { addAsParameter: true, parameterName: 'Inline' },
      markAsFlaky: false,
    });
  });

  describe('default config loader', () => {
    const cwd = process.cwd();
    let dir: string;

    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qase-pw-config-'));
      process.chdir(dir);
    });

    afterEach(() => {
      process.chdir(cwd);
      fs.rmSync(dir, { recursive: true, force: true });
    });

    it('reads framework.playwright from qase.config.json', () => {
      fs.writeFileSync(
        path.join(dir, 'qase.config.json'),
        JSON.stringify({ framework: { playwright: { markAsFlaky: true } } }),
      );

      const reporter = new PlaywrightQaseReporter({} as PlaywrightQaseOptionsType);

      expect(reporter['options']).toEqual({ markAsFlaky: true });
    });

    it('validates framework.playwright in qase.config.json', () => {
      fs.writeFileSync(
        path.join(dir, 'qase.config.json'),
        JSON.stringify({ framework: { playwright: { markAsFlaky: 'yes' } } }),
      );

      expect(() => new PlaywrightQaseReporter({} as PlaywrightQaseOptionsType)).toThrow(
        /framework\.playwright\.markAsFlaky/,
      );
    });
  });
});
