import { JSONSchemaType } from 'ajv';

import { ModeEnum } from '../options';
import { ConfigType } from './config-type';

export const configValidationSchema: JSONSchemaType<ConfigType> = {
    type: 'object',
    additionalProperties: true,

    properties: {
        mode: {
            type: 'string',
            enum: [ModeEnum.report, ModeEnum.testops],
            nullable: true,
        },
        logging: {
            type: 'boolean',
            nullable: true,
        },

        testops: {
            type: 'object',
            nullable: true,
            additionalProperties: true,

            properties: {
                apiToken: {
                    type: 'string',
                    nullable: true,
                },
                projectCode: {
                    type: 'string',
                    nullable: true,
                },

                frameworkName: {
                    type: 'string',
                    nullable: true,
                },
                reporterName: {
                    type: 'string',
                    nullable: true,
                },
                uploadAttachments: {
                    type: 'boolean',
                    nullable: true,
                },

                baseUrl: {
                    type: 'string',
                    nullable: true,
                },

                runId: {
                    type: 'number',
                    nullable: true,
                },
                runName: {
                    type: 'string',
                    nullable: true,
                },
                runDescription: {
                    type: 'string',
                    nullable: true,
                },
                runComplete: {
                    type: 'boolean',
                    nullable: true,
                },
                environmentId: {
                    type: 'number',
                    nullable: true,
                },
            },
        },

        report: {
            type: 'object',
            nullable: true,
            additionalProperties: true,

            properties: {
                path: {
                    type: 'string',
                    nullable: true,
                },
            },
        },
    },
};
