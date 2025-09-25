import { expect } from '@jest/globals';
import { applyStatusMapping, validateStatusMapping } from '../../src/utils/status-mapping-utils';
import { TestStatusEnum } from '../../src/models/test-execution';

describe('status-mapping-utils', () => {
  describe('applyStatusMapping', () => {
    it('should return original status when no mapping provided', () => {
      const result = applyStatusMapping(TestStatusEnum.passed);
      expect(result).toBe(TestStatusEnum.passed);
    });

    it('should return original status when mapping is undefined', () => {
      const result = applyStatusMapping(TestStatusEnum.passed, undefined);
      expect(result).toBe(TestStatusEnum.passed);
    });

    it('should apply mapping when configured', () => {
      const statusMapping = {
        [TestStatusEnum.invalid]: TestStatusEnum.failed,
        [TestStatusEnum.skipped]: TestStatusEnum.passed,
      };
      
      const result1 = applyStatusMapping(TestStatusEnum.invalid, statusMapping);
      expect(result1).toBe(TestStatusEnum.failed);
      
      const result2 = applyStatusMapping(TestStatusEnum.skipped, statusMapping);
      expect(result2).toBe(TestStatusEnum.passed);
    });

    it('should return original status when no mapping found', () => {
      const statusMapping = {
        [TestStatusEnum.invalid]: TestStatusEnum.failed,
      };
      
      const result = applyStatusMapping(TestStatusEnum.passed, statusMapping);
      expect(result).toBe(TestStatusEnum.passed);
    });

    it('should handle invalid mapping gracefully', () => {
      const invalidMapping = {
        [TestStatusEnum.passed]: 'invalid_status',
      };
      
      const result = applyStatusMapping(TestStatusEnum.passed, invalidMapping);
      expect(result).toBe(TestStatusEnum.passed);
    });
  });

  describe('validateStatusMapping', () => {
    it('should return empty array for valid mapping', () => {
      const validMapping = {
        [TestStatusEnum.invalid]: TestStatusEnum.failed,
        [TestStatusEnum.skipped]: TestStatusEnum.passed,
      };
      
      const errors = validateStatusMapping(validMapping);
      expect(errors).toEqual([]);
    });

    it('should return errors for invalid source status', () => {
      const invalidMapping = {
        'invalid_source': TestStatusEnum.failed,
      };
      
      const errors = validateStatusMapping(invalidMapping);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Invalid source status');
    });

    it('should return errors for invalid target status', () => {
      const invalidMapping = {
        [TestStatusEnum.passed]: 'invalid_target',
      };
      
      const errors = validateStatusMapping(invalidMapping);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Invalid target status');
    });

    it('should return multiple errors for multiple invalid mappings', () => {
      const invalidMapping = {
        'invalid_source': 'invalid_target',
        [TestStatusEnum.passed]: 'another_invalid_target',
      };
      
      const errors = validateStatusMapping(invalidMapping);
      expect(errors).toHaveLength(3);
    });
  });
});
