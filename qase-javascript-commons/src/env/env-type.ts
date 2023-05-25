import { EnvEnum } from './env-enum';

import { ModeEnum } from '../options';

export interface EnvType {
    [EnvEnum.mode]?: `${ModeEnum}`;
    [EnvEnum.logging]?: boolean;

    [EnvEnum.testopsApiToken]?: string;
    [EnvEnum.testopsProjectCode]?: string;
    [EnvEnum.testopsBaseUrl]?: string;
    [EnvEnum.testopsUploadAttachments]?: boolean;
    [EnvEnum.testopsRunId]?: number;
    [EnvEnum.testopsRunName]?: string;
    [EnvEnum.testopsRunDescription]?: string;
    [EnvEnum.testopsRunComplete]?: boolean;
    [EnvEnum.testopsEnvironmentId]?: number;

    [EnvEnum.reportPath]?: string;
}
