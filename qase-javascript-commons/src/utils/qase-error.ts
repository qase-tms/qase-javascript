export type ErrorOptionsType = {
  cause?: unknown;
}

export interface QaseErrorInterface extends Error {
  cause?: unknown;
}

/**
 * @class QaseError
 * @extends Error
 * @implements QaseErrorInterface
 */
export class QaseError extends Error implements QaseErrorInterface {
  /**
   * @type {unknown}
   */
  public cause?: unknown;

  constructor(message?: string, options?: ErrorOptionsType) {
    super(message);

    this.cause = options?.cause;
  }
}
