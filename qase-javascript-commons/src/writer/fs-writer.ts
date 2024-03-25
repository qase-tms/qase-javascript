import { mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';

import { WriterInterface } from './writer-interface';

import { TestResultType } from '../models';
import { FormatterInterface } from '../formatter';
import { FormatEnum } from './driver-enum';

export type FsWriterOptionsType = {
  path?: string | undefined;
  format?: `${FormatEnum}` | undefined;
};

/**
 * @class FsWriter
 * @implements WriterInterface
 */
export class FsWriter implements WriterInterface {
  private path: string;
  private format: string;

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
      format = FormatEnum.json,
    } = options ?? {};

    this.path = pathOptions;
    this.format = format;
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

    const filePath = path.join(this.path, `results-${Date.now()}.${this.format}`);

    writeFileSync(filePath, await this.formatter.format(results));

    return filePath;
  }
}
