import { EnvType } from './env-type';
import {
  EnvEnum,
  EnvTestOpsEnum,
  EnvApiEnum,
  EnvRunEnum,
  EnvLocalEnum,
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

  testops: {
    project: env[EnvTestOpsEnum.project],
    baseUrl: env[EnvTestOpsEnum.baseUrl],
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
      environment: env[EnvRunEnum.environment],
    },
  },

  report: {
    connections: {
      [DriverEnum.local]: {
        path: env[EnvLocalEnum.path],
        ext: env[EnvLocalEnum.ext],
      },
    },
  },
});
