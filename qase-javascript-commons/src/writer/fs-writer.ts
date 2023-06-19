import { mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';

import { WriterInterface } from './writer-interface';

import { TestResultType } from "../models";
import { FormatterInterface } from "../formatter";

export type FsWriterOptionsType = {
  path?: string | undefined;
  ext?: string | undefined;
}

/**
 * @class FsWriter
 * @implements WriterInterface
 */
export class FsWriter implements WriterInterface {
  private path: string;
  private ext: string;

  /**
   * @param {FsWriterOptionsType | undefined} options
   * @param {FormatterInterface} formatter
   */
  constructor(
    options: FsWriterOptionsType | undefined,
    private formatter: FormatterInterface,
  ) {
    const {
      path: pathOptions = path.join('build', 'qase-report'),
      ext = 'json',
    } = options ?? {};

    this.path = pathOptions;
    this.ext = ext;
  }

  /**
   * @param {TestResultType[]} results
   * @returns {Promise<string>}
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async write(results: TestResultType[]) {
    try {
      mkdirSync(this.path, { recursive: true });
    } catch (error) {/* ignore */}

    const filePath = path.join(this.path, `results-${Date.now()}.${this.ext}`);

    writeFileSync(filePath, await this.formatter.format(results));

    return filePath;
  }
}
