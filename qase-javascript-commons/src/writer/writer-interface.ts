import { TestResultType } from '../models';

export interface WriterInterface {
  write(results: TestResultType[]): Promise<string>;
}
