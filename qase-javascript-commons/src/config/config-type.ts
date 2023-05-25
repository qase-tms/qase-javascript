import { ModeEnum } from '../options';
import { FileReporterOptionsType, TestOpsOptionsType } from '../reporters';

export type ConfigType = {
    mode?: `${ModeEnum}`;
    logging?: boolean;
    testops?: Partial<Omit<TestOpsOptionsType, 'frameworkName' | 'reporterName'>>;
    report?: Partial<FileReporterOptionsType>;
};
