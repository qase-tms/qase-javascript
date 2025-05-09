import { mkdirSync, writeFileSync, copyFileSync, existsSync, readdirSync, lstatSync, unlinkSync, rmdirSync } from 'fs';
import * as path from 'path';

import { WriterInterface } from './writer-interface';

import { TestResultType, Attachment, Report } from '../models';
import { FormatterInterface, JsonFormatter, JsonpFormatter } from '../formatter';
import { FormatEnum } from './driver-enum';

export interface FsWriterOptionsType {
  path?: string | undefined;
  format?: FormatEnum | undefined;
}

/**
 * @class FsWriter
 * @implements WriterInterface
 */
export class FsWriter implements WriterInterface {
  private readonly path: string;
  private readonly format: FormatEnum;
  private formatter: FormatterInterface;

  /**
   * @param {FsWriterOptionsType | undefined} options
   */
  constructor(
    options: FsWriterOptionsType | undefined,
  ) {
    const {
      path: pathOptions = path.join('build', 'qase-report'),
      format = options?.format ?? FormatEnum.json,
    } = options ?? {};

    this.path = pathOptions;
    this.format = format;

    if (this.format === FormatEnum.json) {
      this.formatter = new JsonFormatter();
    } else {
      this.formatter = new JsonpFormatter();
    }
  }

  /**
   * @returns {void}
   */
  clearPreviousResults(): void {
    this.deleteFolderRecursive(this.path);
  }

  /**
   * @param {Attachment[]} attachments
   * @returns {Attachment[]}
   */
  writeAttachment(attachments: Attachment[]): Attachment[] {
    const attachmentsPath = path.join(this.path, 'attachments');

    try {
      mkdirSync(attachmentsPath, { recursive: true });
    } catch (error) {/* ignore */
    }

    for (const attachment of attachments) {
      if (attachment.file_path) {
        attachment.file_name = path.basename(attachment.file_path);
      }

      const filePath = path.join(attachmentsPath, `${attachment.id}-${attachment.file_name}`);

      if (attachment.file_path) {
        copyFileSync(attachment.file_path, filePath);
        attachment.file_path = filePath;
        continue;
      }

      writeFileSync(filePath, attachment.content);
      attachment.file_path = filePath;
    }

    return attachments;
  }

  /**
   * @param {TestResultType[]} results
   * @returns {Promise<string>}
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async writeReport(results: Report): Promise<string> {
    try {
      mkdirSync(this.path, { recursive: true });
    } catch (error) {/* ignore */
    }

    const filePath = path.join(this.path, `report.${this.format}`);

    writeFileSync(filePath, await this.formatter.format(results));

    return filePath;
  }

  /**
   * @returns {Promise<void>}
   * @param {TestResultType} result
   */
  async writeTestResult(result: TestResultType): Promise<void> {
    const resultsPath = path.join(this.path, 'results');

    try {
      mkdirSync(resultsPath, { recursive: true });
    } catch (error) {/* ignore */
    }

    const filePath = path.join(resultsPath, `${result.id}.${this.format}`);

    writeFileSync(filePath, await this.formatter.format(result));

  }

  private deleteFolderRecursive(directoryPath: string) {
    if (existsSync(directoryPath)) {
      readdirSync(directoryPath).forEach((file) => {
        const curPath = path.join(directoryPath, file);
        if (lstatSync(curPath).isDirectory()) { // recurse
          this.deleteFolderRecursive(curPath);
        } else { // delete file
          unlinkSync(curPath);
        }
      });
      rmdirSync(directoryPath);
    }
  }
}
