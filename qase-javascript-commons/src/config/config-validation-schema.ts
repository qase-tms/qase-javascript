import { JSONSchemaType } from 'ajv';

import { ModeEnum } from '../options';
import { DriverEnum, FormatEnum } from '../writer';
import { ConfigType } from './config-type';

/**
 * @type {JSONSchemaType<ConfigType>}
 */
export const configValidationSchema: JSONSchemaType<ConfigType> = {
  type: 'object',

  properties: {
    mode: {
      type: 'string',
      enum: [ModeEnum.report, ModeEnum.testops, ModeEnum.off],
      nullable: true,
    },
    fallback: {
      type: 'string',
      enum: [ModeEnum.report, ModeEnum.testops, ModeEnum.off],
      nullable: true,
    },
    debug: {
      type: 'boolean',
      nullable: true,
    },
    environment: {
      type: ['string', 'number'],
      nullable: true,
    },
    captureLogs: {
      type: 'boolean',
      nullable: true,
    },

    testops: {
      type: 'object',
      nullable: true,

      properties: {
        api: {
          type: 'object',
          nullable: true,

          properties: {
            token: {
              type: 'string',
              nullable: true,
            },

            baseUrl: {
              type: 'string',
              nullable: true,
            },

            headers: {
              type: 'object',
              nullable: true,
              additionalProperties: false,
              patternProperties: {
                '^.*$': {
                  type: 'string',
                },
              },
            },

            retries: {
              type: 'number',
              nullable: true,
            },

            retryDelay: {
              type: 'number',
              nullable: true,
            },
          },
        },

        project: {
          type: 'string',
          nullable: true,
        },

        uploadAttachments: {
          type: 'boolean',
          nullable: true,
        },

        run: {
          type: 'object',
          nullable: true,

          properties: {
            id: {
              type: 'number',
              nullable: true,
            },
            title: {
              type: 'string',
              nullable: true,
            },
            description: {
              type: 'string',
              nullable: true,
            },
            complete: {
              type: 'boolean',
              nullable: true,
            },
          },
        },

        plan: {
          type: 'object',
          nullable: true,

          properties: {
            id: {
              type: 'number',
              nullable: true,
            },
          },
        },

        chunk: {
          type: 'number',
          nullable: true,
        },

        defect: {
          type: 'boolean',
          nullable: true,
        },

        useV2: {
          type: 'boolean',
          nullable: true,
        },
      },
    },

    report: {
      type: 'object',
      nullable: true,

      properties: {
        driver: {
          type: 'string',
          enum: [DriverEnum.local],
          nullable: true,
        },

        connections: {
          type: 'object',
          nullable: true,

          properties: {
            [DriverEnum.local]: {
              type: 'object',
              nullable: true,

              properties: {
                path: {
                  type: 'string',
                  nullable: true,
                },

                format: {
                  type: 'string',
                  enum: [FormatEnum.json, FormatEnum.jsonp],
                  nullable: true,
                },
              },
            },
          },
        },
      },
    },
  },
};
