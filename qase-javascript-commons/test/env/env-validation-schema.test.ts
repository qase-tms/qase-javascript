import { expect } from '@jest/globals';
import envSchema from 'env-schema';
import { envValidationSchema } from '../../src/env/env-validation-schema';
import { EnvConfigurationsEnum } from '../../src/env/env-enum';

describe('envValidationSchema', () => {
  describe('configurations environment variables', () => {
    it('should validate valid configurations values', () => {
      const env = {
        [EnvConfigurationsEnum.values]: 'group1=value1,group2=value2',
        [EnvConfigurationsEnum.createIfNotExists]: true,
      };

      const result = envSchema({
        schema: envValidationSchema,
        data: env,
      });

      expect(result[EnvConfigurationsEnum.values]).toBe('group1=value1,group2=value2');
      expect(result[EnvConfigurationsEnum.createIfNotExists]).toBe(true);
    });

    it('should validate configurations values as string', () => {
      const env = {
        [EnvConfigurationsEnum.values]: 'group1=value1',
      };

      const result = envSchema({
        schema: envValidationSchema,
        data: env,
      });

      expect(result[EnvConfigurationsEnum.values]).toBe('group1=value1');
    });

    it('should validate createIfNotExists as boolean', () => {
      const env = {
        [EnvConfigurationsEnum.createIfNotExists]: false,
      };

      const result = envSchema({
        schema: envValidationSchema,
        data: env,
      });

      expect(result[EnvConfigurationsEnum.createIfNotExists]).toBe(false);
    });

    it('should handle missing configurations values', () => {
      const env = {};

      const result = envSchema({
        schema: envValidationSchema,
        data: env,
      });

      expect(result[EnvConfigurationsEnum.values]).toBeUndefined();
      expect(result[EnvConfigurationsEnum.createIfNotExists]).toBeUndefined();
    });

    it('should handle null configurations values', () => {
      const env = {
        [EnvConfigurationsEnum.values]: null,
        [EnvConfigurationsEnum.createIfNotExists]: null,
      };

      const result = envSchema({
        schema: envValidationSchema,
        data: env,
      });

      expect(result[EnvConfigurationsEnum.values]).toBeNull();
      expect(result[EnvConfigurationsEnum.createIfNotExists]).toBeNull();
    });
  });
}); 
