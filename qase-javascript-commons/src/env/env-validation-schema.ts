import { JSONSchemaType } from 'env-schema';

import { EnvType } from './env-type';
import { EnvEnum, EnvTestOpsEnum, EnvReportEnum } from './env-enum';

import { ModeEnum } from '../options';

export const envValidationSchema: JSONSchemaType<EnvType> = {
  type: 'object',
  additionalProperties: true,

  properties: {
    [EnvEnum.mode]: {
      type: 'string',
      enum: [ModeEnum.report, ModeEnum.testops],
      nullable: true,
    },
    [EnvEnum.logging]: {
      type: 'boolean',
      nullable: true,
    },

    [EnvTestOpsEnum.apiToken]: {
      type: 'string',
      nullable: true,
    },
    [EnvTestOpsEnum.projectCode]: {
      type: 'string',
      nullable: true,
    },
    [EnvTestOpsEnum.frameworkName]: {
      type: 'string',
      nullable: true,
    },
    [EnvTestOpsEnum.reporterName]: {
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
    [EnvTestOpsEnum.runId]: {
      type: 'number',
      nullable: true,
    },
    [EnvTestOpsEnum.runName]: {
      type: 'string',
      nullable: true,
    },
    [EnvTestOpsEnum.runDescription]: {
      type: 'string',
      nullable: true,
    },
    [EnvTestOpsEnum.runComplete]: {
      type: 'boolean',
      nullable: true,
    },
    [EnvTestOpsEnum.environmentId]: {
      type: 'number',
      nullable: true,
    },

    [EnvReportEnum.path]: {
      type: 'string',
      nullable: true,
    },
  },
};
