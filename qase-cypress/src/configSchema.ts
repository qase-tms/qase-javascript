import { JSONSchemaType } from 'ajv'

import { FrameworkOptionsType } from 'qase-javascript-commons'

import { ReporterOptionsType } from './options'

export const configSchema: JSONSchemaType<FrameworkOptionsType<'cypress', ReporterOptionsType>> = {
  type: 'object',
  nullable: true,

  properties: {
    framework: {
      type: 'object',
      nullable: true,

      properties: {
        cypress: {
          type: 'object',
          nullable: true,

          properties: {
            screenshotsFolder: {
              type: 'string',
              nullable: true,
            },
            videosFolder: {
              type: 'string',
              nullable: true,
            },
          }
        }
      }
    }
  }
}
