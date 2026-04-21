import { JSONSchemaType } from 'ajv'

import { FrameworkOptionsType } from 'qase-javascript-commons'

import { ReporterOptionsType } from './options'

export const configSchema: JSONSchemaType<FrameworkOptionsType<'testcafe', ReporterOptionsType>> = {
  type: 'object',
  nullable: true,

  properties: {
    framework: {
      type: 'object',
      nullable: true,

      properties: {
        testcafe: {
          type: 'object',
          nullable: true,

          properties: {
            browser: {
              type: 'object',
              nullable: true,

              properties: {
                addAsParameter: {
                  type: 'boolean',
                  nullable: true,
                },
                parameterName: {
                  type: 'string',
                  nullable: true,
                },
              }
            },
          }
        }
      }
    }
  }
};
