import { JSONSchemaType } from 'env-schema';

import { EnvType } from './env-type';
import {
  EnvApiEnum, EnvBatchEnum,
  EnvEnum,
  EnvLocalEnum,
  EnvPlanEnum,
  EnvRunEnum,
  EnvTestOpsEnum, 
  EnvConfigurationsEnum,
} from './env-enum';

import { ModeEnum } from '../options';
import { FormatEnum } from '../writer';

/**
 * @type {JSONSchemaType<EnvType>}
 */
export const envValidationSchema: JSONSchemaType<EnvType> = {
  type: 'object',

  properties: {
    [EnvEnum.mode]: {
      type: 'string',
      enum: [ModeEnum.report, ModeEnum.testops, ModeEnum.off],
      nullable: true,
    },
    [EnvEnum.fallback]: {
      type: 'string',
      enum: [ModeEnum.report, ModeEnum.testops, ModeEnum.off],
      nullable: true,
    },
    [EnvEnum.debug]: {
      type: 'boolean',
      nullable: true,
    },
    [EnvEnum.environment]: {
      type: 'string',
      nullable: true,
    },
    [EnvEnum.captureLogs]: {
      type: 'boolean',
      nullable: true,
    },
    [EnvEnum.rootSuite]: {
      type: 'string',
      nullable: true,
    },

    [EnvTestOpsEnum.project]: {
      type: 'string',
      nullable: true,
    },
    [EnvTestOpsEnum.uploadAttachments]: {
      type: 'boolean',
      nullable: true,
    },
    [EnvTestOpsEnum.uploadTrace]: {
      type: 'boolean',
      nullable: true,
    },
    [EnvTestOpsEnum.defect]: {
      type: 'boolean',
      nullable: true,
    },

    [EnvApiEnum.token]: {
      type: 'string',
      nullable: true,
    },
    [EnvApiEnum.host]: {
      type: 'string',
      nullable: true,
    },

    [EnvRunEnum.id]: {
      type: 'number',
      nullable: true,
    },
    [EnvRunEnum.title]: {
      type: 'string',
      nullable: true,
    },
    [EnvRunEnum.description]: {
      type: 'string',
      nullable: true,
    },
    [EnvRunEnum.complete]: {
      type: 'boolean',
      nullable: true,
    },
    [EnvRunEnum.tags]: {
      type: 'string',
      nullable: true,
    },

    [EnvPlanEnum.id]: {
      type: 'number',
      nullable: true,
    },

    [EnvBatchEnum.size]: {
      type: 'number',
      nullable: true,
    },

    [EnvConfigurationsEnum.values]: {
      type: 'string',
      nullable: true,
    },
    [EnvConfigurationsEnum.createIfNotExists]: {
      type: 'boolean',
      nullable: true,
    },

    [EnvLocalEnum.path]: {
      type: 'string',
      nullable: true,
    },
    [EnvLocalEnum.format]: {
      type: 'string',
      enum: [FormatEnum.json, FormatEnum.jsonp],
      nullable: true,
    },
  },
};
