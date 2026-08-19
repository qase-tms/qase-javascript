import { expect } from '@jest/globals';
import { envToConfig } from '../../src/env/env-to-config';
import { EnvType } from '../../src/env/env-type';
import { EnvAttachmentsEnum, EnvConfigurationsEnum } from '../../src/env/env-enum';

describe('envToConfig', () => {
  describe('attachments', () => {
    it('should map attachment upload concurrency and timeout', () => {
      const env: EnvType = {
        [EnvAttachmentsEnum.concurrency]: 8,
        [EnvAttachmentsEnum.timeout]: 60,
      };

      const result = envToConfig(env);

      expect(result.testops?.attachments).toEqual({ concurrency: 8, timeout: 60 });
    });

    it('should leave attachments undefined when nothing is set', () => {
      const result = envToConfig({});

      expect(result.testops?.attachments).toBeUndefined();
    });
  });

  describe('configurations', () => {
    it('should parse configurations values from environment variable', () => {
      const env: EnvType = {
        [EnvConfigurationsEnum.values]: 'group1=value1,group2=value2,group3=value3',
        [EnvConfigurationsEnum.createIfNotExists]: true,
      };

      const result = envToConfig(env);

      expect(result.testops?.configurations).toEqual({
        values: [
          { name: 'group1', value: 'value1' },
          { name: 'group2', value: 'value2' },
          { name: 'group3', value: 'value3' },
        ],
        createIfNotExists: true,
      });
    });

    it('should handle configurations values with spaces', () => {
      const env: EnvType = {
        [EnvConfigurationsEnum.values]: 'group1=value1, group2 = value2 , group3= value3',
        [EnvConfigurationsEnum.createIfNotExists]: false,
      };

      const result = envToConfig(env);

      expect(result.testops?.configurations).toEqual({
        values: [
          { name: 'group1', value: 'value1' },
          { name: 'group2', value: 'value2' },
          { name: 'group3', value: 'value3' },
        ],
        createIfNotExists: false,
      });
    });

    it('should handle empty value in configurations', () => {
      const env: EnvType = {
        [EnvConfigurationsEnum.values]: 'group1=value1,group2=,group3=value3',
      };

      const result = envToConfig(env);

      expect(result.testops?.configurations).toEqual({
        values: [
          { name: 'group1', value: 'value1' },
          { name: 'group2', value: '' },
          { name: 'group3', value: 'value3' },
        ],
        createIfNotExists: undefined,
      });
    });

    it('should return undefined when configurations values are not provided', () => {
      const env: EnvType = {};

      const result = envToConfig(env);

      expect(result.testops?.configurations).toBeUndefined();
    });

    it('should handle single configurations value', () => {
      const env: EnvType = {
        [EnvConfigurationsEnum.values]: 'group1=value1',
        [EnvConfigurationsEnum.createIfNotExists]: true,
      };

      const result = envToConfig(env);

      expect(result.testops?.configurations).toEqual({
        values: [
          { name: 'group1', value: 'value1' },
        ],
        createIfNotExists: true,
      });
    });
  });
}); 
