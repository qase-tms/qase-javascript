import { EnvType } from './env-type';
import {
  EnvEnum,
  EnvTestOpsEnum,
  EnvApiEnum,
  EnvRunEnum,
  EnvLocalEnum,
  EnvPlanEnum,
} from './env-enum';

import { DriverEnum } from '../writer';
import { ConfigType } from '../config';

/**
 * @param {EnvType} env
 * @returns {ConfigType}
 */
export const envToConfig = (env: EnvType): ConfigType => ({
  mode: env[EnvEnum.mode],
  debug: env[EnvEnum.debug],
  environment: env[EnvEnum.environment],
  captureLogs: env[EnvEnum.captureLogs],

  testops: {
    project: env[EnvTestOpsEnum.project],
    uploadAttachments: env[EnvTestOpsEnum.uploadAttachments],

    api: {
      token: env[EnvApiEnum.token],
      baseUrl: env[EnvApiEnum.baseUrl],
    },

    run: {
      id: env[EnvRunEnum.id],
      title: env[EnvRunEnum.title],
      description: env[EnvRunEnum.description],
      complete: env[EnvRunEnum.complete],
    },

    plan: {
      id: env[EnvPlanEnum.id],
    },

    chunk: env[EnvTestOpsEnum.chunk],
    defect: env[EnvTestOpsEnum.defect],
    useV2: env[EnvTestOpsEnum.useV2],
  },

  report: {
    connections: {
      [DriverEnum.local]: {
        path: env[EnvLocalEnum.path],
        format: env[EnvLocalEnum.format],
      },
    },
  },
});
