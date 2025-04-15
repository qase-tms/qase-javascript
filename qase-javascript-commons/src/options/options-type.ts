import { ModeEnum } from './mode-enum';

import { DriverEnum, FsWriterOptionsType } from '../writer';
import { TestOpsOptionsType } from '../models/config/TestOpsOptionsType';

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
  testops?:
    | RecursivePartial<TestOpsOptionsType>
    | undefined;
  report?: RecursivePartial<AdditionalReportOptionsType> | undefined;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type FrameworkOptionsType<F extends string, O> = {
  framework?: Partial<Record<F, O>>
}
