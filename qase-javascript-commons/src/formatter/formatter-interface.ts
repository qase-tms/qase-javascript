export interface FormatterInterface {
  format(result: unknown): Promise<string>;
}
