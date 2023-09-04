import { readFileSync } from 'fs'
import { join } from 'path'

import { JSONSchemaType } from 'ajv'
import merge from 'lodash.merge';

import { QaseError } from '../utils/qase-error'
import { JsonValidationError, validateJson } from '../utils/validate-json'

import { ConfigLoaderInterface } from './config-loader-interface'
import { ConfigType } from './config-type'
import { configValidationSchema } from './config-validation-schema'

export class ConfigLoader<T extends Partial<ConfigType> & Record<string, unknown>> implements ConfigLoaderInterface<T> {
  private validationSchema: JSONSchemaType<T & ConfigType>;

  constructor(
    validationSchema?: JSONSchemaType<T>,
    private paths = ['qase.config.json', '.qaserc'],
  ) {
    this.validationSchema = merge({}, configValidationSchema, validationSchema);
  }

  private read() {
    for (const path of this.paths) {
      const filePath = join(process.cwd(), path);

      try {
        return readFileSync(filePath, 'utf8');
      } catch (error) {
        const isNotFound =
          error instanceof Error &&
          'code' in error &&
          (error.code === 'ENOENT' || error.code === 'EISDIR');

        if (!isNotFound) {
          throw new QaseError('Cannot read config file', { cause: error });
        }
      }
    }

    return null;
  }

  public load() {
    try {
      const data = this.read();

      if (data) {
        const json: unknown = JSON.parse(data);

        validateJson(this.validationSchema, json);

        return json;
      }
    } catch (error) {
      if (error instanceof JsonValidationError) {
        const [validationError] = error.validationErrors;

        const { instancePath = '', message = '' } = validationError ?? {};
        const configPath = instancePath
          ? `\`${instancePath.substring(1).replace('/', '.')}\``
          : 'it';

        throw new Error(`Invalid config: "${configPath}" ${message}`);
      }

      throw error;
    }

    return null;
  }
}
