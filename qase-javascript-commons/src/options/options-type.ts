import { ModeEnum } from './mode-enum';
import { FileReporterOptionsType, TestOpsOptionsType } from '../reporters';

export type AdditionalTestOpsOptionsType = {
  apiToken?: string;
  reporterName?: string;
};

export type OptionsType = {
  frameworkName: string;
  reporterName: string;
  mode?: `${ModeEnum}`;
  logging?: boolean;
  testops?: Partial<TestOpsOptionsType> & AdditionalTestOpsOptionsType;
  report?: Partial<FileReporterOptionsType>;
};
