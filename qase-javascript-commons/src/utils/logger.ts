import * as fs from 'fs';
import * as path from 'path';
import { isAxiosError } from './is-axios-error';
import { QaseError } from './qase-error';
import { AxiosError } from 'axios';
import get from 'lodash.get';

export class Logger {
  private readonly debug: boolean | undefined;
  private readonly filePath: string;

  constructor(options: { debug?: boolean | undefined, dir?: string }) {
    this.debug = options.debug;

    const dir = options.dir ?? './logs';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    this.filePath = path.join(dir, 'log.txt');
  }

  public log(message: string): void {
    const logMessage = `[INFO] qase: ${message}`;
    console.log(logMessage);
    if (this.debug) {
      this.logToFile(logMessage);
    }
  }

  public logError(message: string, error?: unknown): void {
    const logMessage = `[ERROR] qase: ${this.doLogError(message, error)}`;
    console.error(logMessage);
    if (this.debug) {
      this.logToFile(logMessage);
    }
  }

  public logDebug(message: string): void {
    if (this.debug) {
      const logMessage = `[DEBUG] qase: ${message}`;
      console.log(logMessage);
      this.logToFile(logMessage);
    }
  }

  private logToFile(message: string): void {
    const formattedMessage = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(this.filePath, formattedMessage);
  }

  private doLogError(message: string, error?: unknown): string {
    let logMessage: string = message;

    if (error instanceof Error) {
      if (isAxiosError(error)) {
        logMessage += this.logApiError(error);
      } else if (error instanceof QaseError && error.cause) {
        logMessage += this.doLogError('\n Caused by:', error.cause);
      }

      logMessage += `\n ${error.stack || `${error.name}: ${error.message}`}`;
    } else {
      logMessage += `\n ${String(error)}`;
    }

    return logMessage;
  }

  /**
   * @param {AxiosError} error
   * @private
   */
  private logApiError(error: AxiosError): string {
    let logMessage = '\n';

    const errorMessage: unknown = get(error, 'response.data.errorMessage')
      ?? get(error, 'response.data.error')
      ?? get(error, 'response.statusText')
      ?? 'Unknown error';

    const errorFields = this.formatErrorFields(
      get(error, 'response.data.errorFields'),
    );

    logMessage += `Message: ${String(errorMessage)}`;

    if (errorFields) {
      logMessage += `\n ${errorFields}`;
    }

    return logMessage;
  }

  /**
   * @param errorFields
   * @returns {string | undefined}
   * @private
   */
  private formatErrorFields(errorFields: unknown): string | undefined {
    if (Array.isArray(errorFields)) {
      return errorFields.reduce<string>((acc, item: unknown) => {
        const field: unknown = get(item, 'field');
        const error: unknown = get(item, 'error');

        if (field && error) {
          return acc + `${String(field)}: ${String(error)}\n`;
        }

        return acc;
      }, '');
    }

    return undefined;
  }
}
