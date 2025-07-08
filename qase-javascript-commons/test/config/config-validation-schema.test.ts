import { expect } from '@jest/globals';
import Ajv from 'ajv';
import { configValidationSchema } from '../../src/config/config-validation-schema';

describe('configValidationSchema', () => {
  const ajv = new Ajv();
  const validate = ajv.compile(configValidationSchema);

  describe('testops.configurations', () => {
    it('should validate valid configurations object', () => {
      const validConfig = {
        testops: {
          configurations: {
            values: [
              { name: 'group1', value: 'value1' },
              { name: 'group2', value: 'value2' },
            ],
            createIfNotExists: true,
          },
        },
      };

      const isValid = validate(validConfig);
      expect(isValid).toBe(true);
    });

    it('should validate configurations without createIfNotExists', () => {
      const validConfig = {
        testops: {
          configurations: {
            values: [
              { name: 'group1', value: 'value1' },
            ],
          },
        },
      };

      const isValid = validate(validConfig);
      expect(isValid).toBe(true);
    });

    it('should validate empty values array', () => {
      const validConfig = {
        testops: {
          configurations: {
            values: [],
          },
        },
      };

      const isValid = validate(validConfig);
      expect(isValid).toBe(true);
    });

    it('should reject configurations without values', () => {
      const invalidConfig = {
        testops: {
          configurations: {
            createIfNotExists: true,
          },
        },
      };

      const isValid = validate(invalidConfig);
      expect(isValid).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should reject configurations with invalid values structure', () => {
      const invalidConfig = {
        testops: {
          configurations: {
            values: [
              { name: 'group1' }, // missing value
            ],
          },
        },
      };

      const isValid = validate(invalidConfig);
      expect(isValid).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should reject configurations with invalid name type', () => {
      const invalidConfig = {
        testops: {
          configurations: {
            values: [
              { name: 123, value: 'value1' }, // name should be string
            ],
          },
        },
      };

      const isValid = validate(invalidConfig);
      expect(isValid).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should reject configurations with invalid value type', () => {
      const invalidConfig = {
        testops: {
          configurations: {
            values: [
              { name: 'group1', value: 123 }, // value should be string
            ],
          },
        },
      };

      const isValid = validate(invalidConfig);
      expect(isValid).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should reject configurations with invalid createIfNotExists type', () => {
      const invalidConfig = {
        testops: {
          configurations: {
            values: [
              { name: 'group1', value: 'value1' },
            ],
            createIfNotExists: 'true', // should be boolean
          },
        },
      };

      const isValid = validate(invalidConfig);
      expect(isValid).toBe(false);
      expect(validate.errors).toBeDefined();
    });

    it('should validate null configurations', () => {
      const validConfig = {
        testops: {
          configurations: null,
        },
      };

      const isValid = validate(validConfig);
      expect(isValid).toBe(true);
    });
  });
}); 
