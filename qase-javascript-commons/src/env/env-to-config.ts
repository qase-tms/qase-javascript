import { EnvType } from './env-type';
import {
  EnvEnum,
  EnvTestOpsEnum,
  EnvApiEnum,
  EnvRunEnum,
  EnvLocalEnum,
  EnvPlanEnum, 
  EnvBatchEnum, 
  EnvConfigurationsEnum,
} from './env-enum';

import { DriverEnum } from '../writer';
import { ConfigType } from '../config';
import { FormatEnum } from '../writer/driver-enum';
import { ExternalLinkType } from '../models/config/TestOpsOptionsType';

/**
 * @param {EnvType} env
 * @returns {ConfigType}
 */
export const envToConfig = (env: EnvType): ConfigType => ({
  mode: env[EnvEnum.mode],
  debug: env[EnvEnum.debug],
  environment: env[EnvEnum.environment],
  captureLogs: env[EnvEnum.captureLogs],
  rootSuite: env[EnvEnum.rootSuite],

  testops: {
    project: env[EnvTestOpsEnum.project],
    uploadAttachments: env[EnvTestOpsEnum.uploadAttachments],
    statusFilter: env[EnvTestOpsEnum.statusFilter]?.split(',').map(status => status.trim()) ?? undefined,

    api: {
      token: env[EnvApiEnum.token],
      host: env[EnvApiEnum.host],
    },

    run: {
      id: env[EnvRunEnum.id],
      title: env[EnvRunEnum.title],
      description: env[EnvRunEnum.description],
      complete: env[EnvRunEnum.complete],
      tags: env[EnvRunEnum.tags]?.split(',').map(tag => tag.trim()) ?? [],
      externalLink: env[EnvRunEnum.externalLink] ? (() => {
        try {
          const externalLinkValue = env[EnvRunEnum.externalLink];
          if (!externalLinkValue) return undefined;
          
          const parsed = JSON.parse(externalLinkValue) as { type: string; link: string };
          
          // Validate that type is a valid ExternalLinkType value
          if (parsed.type !== 'jiraCloud' && parsed.type !== 'jiraServer') {
            return undefined;
          }
          
          return {
            type: parsed.type as ExternalLinkType,
            link: parsed.link,
          };
        } catch {
          return undefined;
        }
      })() : undefined,
    },

    plan: {
      id: env[EnvPlanEnum.id],
    },

    batch: {
      size: env[EnvBatchEnum.size],
    },
    defect: env[EnvTestOpsEnum.defect],
    configurations: env[EnvConfigurationsEnum.values] ? {
      values: env[EnvConfigurationsEnum.values].split(',').map(item => {
        const [name, value] = item.split('=');
        return { name: (name ?? '').trim(), value: value ? value.trim() : '' };
      }),
      createIfNotExists: env[EnvConfigurationsEnum.createIfNotExists],
    } : undefined,
  },

  report: {
    connections: {
      [DriverEnum.local]: {
        path: env[EnvLocalEnum.path],
        format: env[EnvLocalEnum.format] as FormatEnum | undefined,
      },
    },
  },
});
