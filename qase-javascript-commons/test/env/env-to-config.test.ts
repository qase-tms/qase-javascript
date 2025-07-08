import { expect } from '@jest/globals';
import { envToConfig } from '../../src/env/env-to-config';
import { EnvType } from '../../src/env/env-type';
import { EnvConfigurationsEnum } from '../../src/env/env-enum';

describe('envToConfig', () => {
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
