import { expect } from '@jest/globals';
import { DisabledException } from '../../src/utils/disabled-exception';

describe('DisabledException', () => {
  it('should be an instance of Error', () => {
    const exception = new DisabledException();

    expect(exception).toBeInstanceOf(Error);
  });

  it('should be an instance of DisabledException', () => {
    const exception = new DisabledException();

    expect(exception).toBeInstanceOf(DisabledException);
  });

  it('should have default error message', () => {
    const exception = new DisabledException();

    expect(exception.message).toBe('');
  });

  it('should allow custom error message', () => {
    const customMessage = 'Custom disabled exception message';
    const exception = new DisabledException(customMessage);

    expect(exception.message).toBe(customMessage);
  });

  it('should be throwable', () => {
    expect(() => {
      throw new DisabledException('Test exception');
    }).toThrow(DisabledException);
  });

  it('should preserve stack trace', () => {
    const exception = new DisabledException('Test');

    expect(exception.stack).toBeDefined();
    expect(typeof exception.stack).toBe('string');
  });
}); 
