import stripAnsi from 'strip-ansi';

import { FormatterInterface } from './formatter-interface';

export type JsonFormatterOptionsType = {
  space?: number | undefined;
};

/**
 * @class JsonFormatter
 * @implements FormatterInterface
 */
export class JsonFormatter implements FormatterInterface {
  private space: number | undefined;

  constructor(options: JsonFormatterOptionsType = {}) {
    const { space = 4 } = options;

    this.space = space;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async format(object: unknown) {
    return JSON.stringify(
      object,
      (key, value: unknown) => {
        if (key === 'error' && value instanceof Error) {
          return stripAnsi(String(value));
        }

        return value;
      },
      this.space,
    );
  }
}
