import Ajv, { ErrorObject, JSONSchemaType } from 'ajv';

/**
 * @type {Ajv}
 */
const validator = new Ajv();

/**
 * @class JsonValidationError
 * @extends Error
 */
export class JsonValidationError extends Error {
  /**
   * @param {ErrorObject[]} validationErrors
   * @param {string} message
   */
  constructor(public validationErrors: ErrorObject[], message?: string) {
    super(message);
  }
}

/**
 * @template T
 * @param {JSONSchemaType<T>} schema
 * @param json
 * @returns {asserts json is T}
 */
export function validateJson<T>(
  schema: JSONSchemaType<T>,
  json: unknown,
): asserts json is T {
  if (!validator.validate<T>(schema, json)) {
    throw new JsonValidationError(
      validator.errors ? [...validator.errors] : [],
    );
  }
}
