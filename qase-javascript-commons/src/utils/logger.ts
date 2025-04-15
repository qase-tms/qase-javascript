import * as fs from 'fs';
import * as path from 'path';
import { isAxiosError } from './is-axios-error';
import { QaseError } from './qase-error';
import { AxiosError } from 'axios';

export interface LoggerInterface {
  log(message: string): void;

  logError(message: string, error?: unknown): void;

  logDebug(message: string): void;
}

interface ApiErrorResponse {
  errorMessage?: string;
  error?: string;
  errorFields?: {
    field: string;
    error: string;
  }[];
}

export class Logger implements LoggerInterface {
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

      logMessage += `\n ${error.stack ?? `${error.name}: ${error.message}`}`;
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
    const response = error.response?.data as ApiErrorResponse;
    const statusText = error.response?.statusText;
    
    const errorMessage = response.errorMessage 
      ?? response.error 
      ?? statusText 
      ?? 'Unknown error';

    const errorFields = this.formatErrorFields(response.errorFields);

    let logMessage = `\nMessage: ${errorMessage}`;
    
    if (errorFields) {
      logMessage += `\n${errorFields}`;
    }

    return logMessage;
  }

  /**
   * @param errorFields
   * @returns {string | undefined}
   * @private
   */
  private formatErrorFields(errorFields?: ApiErrorResponse['errorFields']): string | undefined {
    if (!errorFields?.length) {
      return undefined;
    }

    return errorFields
      .map(({ field, error }) => `${field}: ${error}`)
      .join('\n');
  }
}
