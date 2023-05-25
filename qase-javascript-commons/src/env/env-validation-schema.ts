import { JSONSchemaType } from 'env-schema';

import { EnvType } from './env-type';
import { EnvEnum } from './env-enum';

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

        [EnvEnum.testopsApiToken]: {
            type: 'string',
            nullable: true,
        },
        [EnvEnum.testopsProjectCode]: {
            type: 'string',
            nullable: true,
        },
        [EnvEnum.testopsUploadAttachments]: {
            type: 'boolean',
            nullable: true,
        },
        [EnvEnum.testopsBaseUrl]: {
            type: 'string',
            nullable: true,
        },
        [EnvEnum.testopsRunId]: {
            type: 'number',
            nullable: true,
        },
        [EnvEnum.testopsRunName]: {
            type: 'string',
            nullable: true,
        },
        [EnvEnum.testopsRunDescription]: {
            type: 'string',
            nullable: true,
        },
        [EnvEnum.testopsRunComplete]: {
            type: 'boolean',
            nullable: true,
        },
        [EnvEnum.testopsEnvironmentId]: {
            type: 'number',
            nullable: true,
        },

        [EnvEnum.reportPath]: {
            type: 'string',
            nullable: true,
        },
    },
};
