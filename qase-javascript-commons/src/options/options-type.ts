import { ModeEnum } from './mode-enum';

import { DriverEnum, FsWriterOptionsType } from '../writer';
import { TestOpsOptionsType, TestOpsMultiConfigType } from '../models/config/TestOpsOptionsType';

type RecursivePartial<T> = {
  [K in keyof T]?: RecursivePartial<T[K]> | undefined;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ConnectionsType = {
  [DriverEnum.local]?: FsWriterOptionsType;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AdditionalReportOptionsType = {
  driver?: `${DriverEnum}`;
  connections?: ConnectionsType;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type LoggingOptionsType = {
  console?: boolean | undefined;
  file?: boolean | undefined;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type OptionsType = {
  frameworkPackage: string;
  frameworkName: string;
  reporterName: string;
  mode?: `${ModeEnum}` | undefined;
  fallback?: `${ModeEnum}` | undefined;
  captureLogs?: boolean | undefined;
  debug?: boolean | undefined;
  environment?: string | undefined;
  rootSuite?: string | undefined;
  statusMapping?: Record<string, string> | undefined;
  logging?: RecursivePartial<LoggingOptionsType> | undefined;
  testops?:
    | RecursivePartial<TestOpsOptionsType>
    | undefined;
  /** Multi-project configuration (used when mode is testops_multi). */
  testops_multi?: TestOpsMultiConfigType | undefined;
  report?: RecursivePartial<AdditionalReportOptionsType> | undefined;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type FrameworkOptionsType<F extends string, O> = {
  framework?: Partial<Record<F, O>>
}
