import { JSONSchemaType } from 'ajv';

import { FrameworkOptionsType } from 'qase-javascript-commons';

import { ReporterOptionsType } from './options';

export const configSchema: JSONSchemaType<FrameworkOptionsType<'newman', ReporterOptionsType>> = {
  type: 'object',
  nullable: true,

  properties: {
    framework: {
      type: 'object',
      nullable: true,

      properties: {
        newman: {
          type: 'object',
          nullable: true,

          properties: {
            autoCollectParams: {
              type: 'boolean',
              nullable: true,
            },
          },
        },
      },
    },
  },
};
