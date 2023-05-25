import Ajv, { ErrorObject, JSONSchemaType } from 'ajv';

const validator = new Ajv();

export class JSONValidationError extends Error {
    constructor(public validationErrors: ErrorObject[]) {
        super();
    }
}

export function validateJson<T>(schema: JSONSchemaType<T>, json: unknown): asserts json is T {
    if (!validator.validate<T>(schema, json)) {
        throw new JSONValidationError(validator.errors ? [...validator.errors] : []);
    }
}
