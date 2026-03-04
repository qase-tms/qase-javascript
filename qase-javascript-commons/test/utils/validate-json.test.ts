import { expect } from '@jest/globals';
import { validateJson, JsonValidationError } from '../../src/utils/validate-json';
import { JSONSchemaType, ErrorObject } from 'ajv';

describe('validateJson', () => {
  const validSchema: JSONSchemaType<{ name: string; age: number }> = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
    required: ['name', 'age'],
  };

  it('should not throw when JSON is valid', () => {
    const validJson = { name: 'John', age: 30 };

    expect(() => validateJson(validSchema, validJson)).not.toThrow();
  });

  it('should throw JsonValidationError when JSON is invalid', () => {
    const invalidJson = { name: 'John' }; // missing age

    expect(() => validateJson(validSchema, invalidJson)).toThrow(JsonValidationError);
  });

  it('should throw JsonValidationError with validation errors', () => {
    const invalidJson = { name: 123, age: 'invalid' }; // wrong types

    try {
      validateJson(validSchema, invalidJson);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(JsonValidationError);
      if (error instanceof JsonValidationError) {
        expect(error.validationErrors).toBeDefined();
        expect(error.validationErrors.length).toBeGreaterThan(0);
      }
    }
  });

  it('should handle complex nested schemas', () => {
    const complexSchema: JSONSchemaType<{
      user: { name: string; settings: { theme: string } };
    }> = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            settings: {
              type: 'object',
              properties: {
                theme: { type: 'string' },
              },
              required: ['theme'],
            },
          },
          required: ['name', 'settings'],
        },
      },
      required: ['user'],
    };

    const validComplexJson = {
      user: {
        name: 'John',
        settings: { theme: 'dark' },
      },
    };

    expect(() => validateJson(complexSchema, validComplexJson)).not.toThrow();
  });

  it('should handle array schemas', () => {
    const arraySchema: JSONSchemaType<{ items: string[] }> = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['items'],
    };

    const validArrayJson = { items: ['item1', 'item2'] };

    expect(() => validateJson(arraySchema, validArrayJson)).not.toThrow();
  });

  it('should throw for invalid array items', () => {
    const arraySchema: JSONSchemaType<{ items: string[] }> = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['items'],
    };

    const invalidArrayJson = { items: ['item1', 123] }; // number in string array

    expect(() => validateJson(arraySchema, invalidArrayJson)).toThrow(JsonValidationError);
  });
});

describe('JsonValidationError', () => {
  it('should create error with validation errors', () => {
    const mockErrors: ErrorObject[] = [
      {
        instancePath: '/name',
        message: 'should be string',
        keyword: 'type',
        schemaPath: '#/properties/name/type',
        params: { type: 'string' },
      },
    ];

    const error = new JsonValidationError(mockErrors, 'Validation failed');

    expect(error).toBeInstanceOf(Error);
    expect(error.validationErrors).toEqual(mockErrors);
    expect(error.message).toBe('Validation failed');
  });

  it('should create error without message', () => {
    const mockErrors: ErrorObject[] = [
      {
        instancePath: '/age',
        message: 'should be number',
        keyword: 'type',
        schemaPath: '#/properties/age/type',
        params: { type: 'number' },
      },
    ];

    const error = new JsonValidationError(mockErrors);

    expect(error).toBeInstanceOf(Error);
    expect(error.validationErrors).toEqual(mockErrors);
  });
}); 
