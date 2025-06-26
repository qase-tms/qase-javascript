import { expect } from '@jest/globals';
import { CompoundError } from '../../src/models/error';

describe('CompoundError', () => {
  let compoundError: CompoundError;

  beforeEach(() => {
    compoundError = new CompoundError();
  });

  it('should initialize with default message', () => {
    expect(compoundError.message).toBe('CompoundError: One or more errors occurred. ---\n');
  });

  it('should have undefined stacktrace initially', () => {
    expect(compoundError.stacktrace).toBeUndefined();
  });

  describe('addMessage', () => {
    it('should add message to existing message', () => {
      const additionalMessage = 'Additional error message';
      compoundError.addMessage(additionalMessage);

      expect(compoundError.message).toBe(
        'CompoundError: One or more errors occurred. ---\n' +
        'Additional error message\n' +
        '--- End of error message ---\n'
      );
    });

    it('should add multiple messages', () => {
      compoundError.addMessage('First error');
      compoundError.addMessage('Second error');

      expect(compoundError.message).toBe(
        'CompoundError: One or more errors occurred. ---\n' +
        'First error\n' +
        '--- End of error message ---\n' +
        'Second error\n' +
        '--- End of error message ---\n'
      );
    });

    it('should handle empty message', () => {
      compoundError.addMessage('');

      expect(compoundError.message).toBe(
        'CompoundError: One or more errors occurred. ---\n' +
        '\n' +
        '--- End of error message ---\n'
      );
    });
  });

  describe('addStacktrace', () => {
    it('should add stacktrace when none exists', () => {
      const stacktrace = 'Error: Test error\n    at test.js:10:5';
      compoundError.addStacktrace(stacktrace);

      expect(compoundError.stacktrace).toBe(
        '    Error: Test error\n' +
        '        at test.js:10:5\n' +
        '--- End of stack trace ---\n'
      );
    });

    it('should append stacktrace when one already exists', () => {
      const firstStacktrace = 'Error: First error\n    at first.js:5:10';
      const secondStacktrace = 'Error: Second error\n    at second.js:15:20';

      compoundError.addStacktrace(firstStacktrace);
      compoundError.addStacktrace(secondStacktrace);

      expect(compoundError.stacktrace).toBe(
        '    Error: First error\n' +
        '        at first.js:5:10\n' +
        '--- End of stack trace ---\n' +
        '    Error: Second error\n' +
        '        at second.js:15:20\n' +
        '--- End of stack trace ---\n'
      );
    });

    it('should handle empty stacktrace', () => {
      compoundError.addStacktrace('');

      expect(compoundError.stacktrace).toBe(
        '    \n' +
        '--- End of stack trace ---\n'
      );
    });

    it('should handle stacktrace with single line', () => {
      compoundError.addStacktrace('Single line error');

      expect(compoundError.stacktrace).toBe(
        '    Single line error\n' +
        '--- End of stack trace ---\n'
      );
    });

    it('should handle stacktrace with multiple lines', () => {
      const multiLineStacktrace = 'Error: Multi-line error\n    at line1.js:1:1\n    at line2.js:2:2';
      compoundError.addStacktrace(multiLineStacktrace);

      expect(compoundError.stacktrace).toBe(
        '    Error: Multi-line error\n' +
        '        at line1.js:1:1\n' +
        '        at line2.js:2:2\n' +
        '--- End of stack trace ---\n'
      );
    });
  });

  describe('combined usage', () => {
    it('should handle both message and stacktrace', () => {
      compoundError.addMessage('Test error message');
      compoundError.addStacktrace('Error: Test\n    at test.js:1:1');

      expect(compoundError.message).toBe(
        'CompoundError: One or more errors occurred. ---\n' +
        'Test error message\n' +
        '--- End of error message ---\n'
      );

      expect(compoundError.stacktrace).toBe(
        '    Error: Test\n' +
        '        at test.js:1:1\n' +
        '--- End of stack trace ---\n'
      );
    });

    it('should handle multiple messages and stacktraces', () => {
      compoundError.addMessage('First message');
      compoundError.addStacktrace('First stack');
      compoundError.addMessage('Second message');
      compoundError.addStacktrace('Second stack');

      expect(compoundError.message).toBe(
        'CompoundError: One or more errors occurred. ---\n' +
        'First message\n' +
        '--- End of error message ---\n' +
        'Second message\n' +
        '--- End of error message ---\n'
      );

      expect(compoundError.stacktrace).toBe(
        '    First stack\n' +
        '--- End of stack trace ---\n' +
        '    Second stack\n' +
        '--- End of stack trace ---\n'
      );
    });
  });
}); 
