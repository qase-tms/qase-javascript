import { ModeEnum } from './mode-enum';
import { FileReporterOptionsType, TestOpsOptionsType } from '../reporters';

export type OptionsType = {
    mode?: `${ModeEnum}`;
    logging?: boolean;
    testops?: Partial<TestOpsOptionsType>;
    report?: Partial<FileReporterOptionsType>;
};
