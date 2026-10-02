import { expect } from '@jest/globals';
import path from 'path';
import ts from 'typescript';

const SOURCE = path.resolve(__dirname, '../../src/options/composeOptions.ts');
const DECLARATION = '/virtual/composeOptions.d.ts';
const CONSUMER = '/virtual/consumer.ts';

/**
 * Emits the declaration file for composeOptions.ts the same way the build does.
 */
const emitDeclaration = (): string => {
  let output = '';
  const program = ts.createProgram([SOURCE], {
    declaration: true,
    emitDeclarationOnly: true,
    strict: true,
    skipLibCheck: true,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ESNext,
    esModuleInterop: true,
  });
  program.emit(undefined, (fileName, text) => {
    if (fileName.endsWith('composeOptions.d.ts')) output = text;
  });
  return output;
};

/**
 * Type-checks the emitted declaration in a program that, like a consumer
 * project, does not load lodash typings.
 */
const checkAsConsumer = (declaration: string, consumer: string): string[] => {
  const options: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    skipLibCheck: false,
    types: [],
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    lib: ['lib.es2020.d.ts'],
  };
  const host = ts.createCompilerHost(options);
  const files: Record<string, string> = { [DECLARATION]: declaration, [CONSUMER]: consumer };
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, ...rest) => {
    const text = files[fileName];
    return text !== undefined
      ? ts.createSourceFile(fileName, text, languageVersion)
      : getSourceFile(fileName, languageVersion, ...rest);
  };
  host.fileExists = (fileName) => fileName in files || ts.sys.fileExists(fileName);
  host.directoryExists = (dir) => dir === path.dirname(DECLARATION) || ts.sys.directoryExists(dir);
  host.readFile = (fileName) => files[fileName] ?? ts.sys.readFile(fileName);

  const program = ts.createProgram([CONSUMER, DECLARATION], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.file?.fileName === DECLARATION || d.file?.fileName === CONSUMER)
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
};

describe('composeOptions declaration', () => {
  const declaration = emitDeclaration();

  it('should not augment third-party modules', () => {
    expect(declaration).not.toMatch(/declare\s+module/);
  });

  it('should type-check without lodash typings and keep the merged return type', () => {
    const consumer = [
      "import { composeOptions } from './composeOptions';",
      "const merged = composeOptions({ a: 1 }, { b: 'x' });",
      'export const check: { a: number; b: string } = merged;',
    ].join('\n');

    expect(checkAsConsumer(declaration, consumer)).toEqual([]);
  });
});
