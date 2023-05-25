import { EnvEnum } from './env-enum';
import { EnvType } from './env-type';

import { omitEmpty } from '../utils/omit-empty';

export const envToOptions = (env: EnvType) => {
    const testops = {
        apiToken: env[EnvEnum.testopsApiToken],
        projectCode: env[EnvEnum.testopsProjectCode],
        baseUrl: env[EnvEnum.testopsBaseUrl],
        uploadAttachments: env[EnvEnum.testopsUploadAttachments],
        runId: env[EnvEnum.testopsRunId],
        runName: env[EnvEnum.testopsRunName],
        runDescription: env[EnvEnum.testopsRunDescription],
        runComplete: env[EnvEnum.testopsRunComplete],
        environmentId: env[EnvEnum.testopsEnvironmentId],
    };

    omitEmpty(testops);

    const report = {
        path: env[EnvEnum.reportPath],
    };

    omitEmpty(report);

    const options = {
        mode: env[EnvEnum.mode],
        logging: env[EnvEnum.logging],
        testops: Object.keys(testops).length ? testops : undefined,
        report: Object.keys(report).length ? report : undefined,
    };

    omitEmpty(options);

    return options;
};
