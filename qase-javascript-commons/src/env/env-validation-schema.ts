import { JSONSchemaType } from 'env-schema';

import { EnvType } from './env-type';
import {
  EnvApiEnum,
  EnvEnum,
  EnvLocalEnum,
  EnvRunEnum,
  EnvTestOpsEnum,
} from './env-enum';

import { ModeEnum } from '../options';

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
    [EnvEnum.debug]: {
      type: 'boolean',
      nullable: true,
    },
    [EnvEnum.environment]: {
      type: ['string', 'number'],
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
    [EnvTestOpsEnum.baseUrl]: {
      type: 'string',
      nullable: true,
    },

    [EnvApiEnum.token]: {
      type: 'string',
      nullable: true,
    },
    [EnvApiEnum.baseUrl]: {
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
    [EnvRunEnum.environment]: {
      type: 'number',
      nullable: true,
    },

    [EnvLocalEnum.path]: {
      type: 'string',
      nullable: true,
    },
    [EnvLocalEnum.ext]: {
      type: 'string',
      nullable: true,
    },
  },
};
