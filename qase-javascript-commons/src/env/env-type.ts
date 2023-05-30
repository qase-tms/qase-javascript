import { EnvEnum, EnvTestOpsEnum, EnvReportEnum } from './env-enum';

import { ModeEnum } from '../options';

export type EnvType = {
    [EnvEnum.mode]?: `${ModeEnum}`;
    [EnvEnum.logging]?: boolean;

    [EnvTestOpsEnum.apiToken]?: string;
    [EnvTestOpsEnum.projectCode]?: string;
    [EnvTestOpsEnum.baseUrl]?: string;
    [EnvTestOpsEnum.uploadAttachments]?: boolean;
    [EnvTestOpsEnum.frameworkName]?: string;
    [EnvTestOpsEnum.reporterName]?: string;
    [EnvTestOpsEnum.runId]?: number;
    [EnvTestOpsEnum.runName]?: string;
    [EnvTestOpsEnum.runDescription]?: string;
    [EnvTestOpsEnum.runComplete]?: boolean;
    [EnvTestOpsEnum.environmentId]?: number;

    [EnvReportEnum.path]?: string;
}
