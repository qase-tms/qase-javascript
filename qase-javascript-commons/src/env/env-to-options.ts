import { EnvEnum, EnvTestOpsEnum, EnvReportEnum } from './env-enum';
import { EnvType } from './env-type';

import { omitEmpty } from '../utils/omit-empty';

export const envToOptions = (env: EnvType) => {
  const testops = {
    apiToken: env[EnvTestOpsEnum.apiToken],
    projectCode: env[EnvTestOpsEnum.projectCode],
    baseUrl: env[EnvTestOpsEnum.baseUrl],
    frameworkName: env[EnvTestOpsEnum.frameworkName],
    reporterName: env[EnvTestOpsEnum.reporterName],
    uploadAttachments: env[EnvTestOpsEnum.uploadAttachments],
    runId: env[EnvTestOpsEnum.runId],
    runName: env[EnvTestOpsEnum.runName],
    runDescription: env[EnvTestOpsEnum.runDescription],
    runComplete: env[EnvTestOpsEnum.runComplete],
    environmentId: env[EnvTestOpsEnum.environmentId],
  };

  omitEmpty(testops);

  const report = {
    path: env[EnvReportEnum.path],
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
