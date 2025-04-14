import { ModeEnum } from './mode-enum';

import { DriverEnum, FsWriterOptionsType } from '../writer';
import { TestOpsOptionsType } from '../models/config/TestOpsOptionsType';

type RecursivePartial<T> = {
  [K in keyof T]?: RecursivePartial<T[K]> | undefined;
};


export interface ConnectionsType {
  [DriverEnum.local]?: FsWriterOptionsType;
}

export interface AdditionalReportOptionsType {
  driver?: `${DriverEnum}`;
  connections?: ConnectionsType;
}

export interface OptionsType {
  frameworkPackage: string;
  frameworkName: string;
  reporterName: string;
  mode?: `${ModeEnum}` | undefined;
  fallback?: `${ModeEnum}` | undefined;
  captureLogs?: boolean | undefined;
  debug?: boolean | undefined;
  environment?: string | undefined;
  rootSuite?: string | undefined;
  testops?: RecursivePartial<TestOpsOptionsType>;
  report?: RecursivePartial<AdditionalReportOptionsType>;
}

export interface FrameworkOptionsType<F extends string, O> {
  framework?: Partial<Record<F, O>>
}
