import stripAnsi from 'strip-ansi';

import { FormatterInterface } from './formatter-interface';

export interface JsonpFormatterOptionsType {
  space?: number | undefined;
}

/**
 * @class JsonFormatter
 * @implements FormatterInterface
 */
export class JsonpFormatter implements FormatterInterface {
  private space: number | undefined;

  constructor(options: JsonpFormatterOptionsType = {}) {
    const { space = 4 } = options;

    this.space = space;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async format(object: unknown) {
    const json: string = JSON.stringify(
      object,
      (key, value: unknown) => {
        if (key === 'error' && value instanceof Error) {
          return stripAnsi(String(value));
        }

        return value;
      },
      this.space,
    );

    return `qaseJsonp(${json});`;
  }
}
