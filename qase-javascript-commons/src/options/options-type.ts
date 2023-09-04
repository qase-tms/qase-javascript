import { QaseApiOptionsType } from 'qaseio/dist/qaseio';

import { ModeEnum } from './mode-enum';

import { TestOpsOptionsType } from '../reporters';
import { DriverEnum, FsWriterOptionsType } from '../writer';

type RecursivePartial<T> = {
  [K in keyof T]?: RecursivePartial<T[K]> | undefined;
};

export type AdditionalTestOpsOptionsType = {
  api?: RecursivePartial<QaseApiOptionsType>;
};

export type ConnectionsType = {
  [DriverEnum.local]?: FsWriterOptionsType;
};

export type AdditionalReportOptionsType = {
  driver?: `${DriverEnum}`;
  connections?: ConnectionsType;
};

export type OptionsType = {
  frameworkPackage: string;
  frameworkName: string;
  reporterName: string;
  mode?: `${ModeEnum}` | undefined;
  debug?: boolean | undefined;
  environment?: string | number | undefined;
  testops?:
    | (RecursivePartial<TestOpsOptionsType> & AdditionalTestOpsOptionsType)
    | undefined;
  report?: RecursivePartial<AdditionalReportOptionsType> | undefined;
};

export type FrameworkOptionsType<F extends string, O> = {
  framework?: Partial<Record<F, O>>
}
