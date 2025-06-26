import { expect } from '@jest/globals';
import { composeOptions } from '../../src/options/composeOptions';

describe('composeOptions', () => {
  it('should merge multiple objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };
    const obj3 = { d: 5 };

    const result = composeOptions(obj1, obj2, obj3);

    expect(result).toEqual({
      a: 1,
      b: 3,
      c: 4,
      d: 5,
    });
  });

  it('should skip undefined values', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: undefined, c: 4 };

    const result = composeOptions(obj1, obj2);

    expect(result).toEqual({
      a: 1,
      b: 2, // Should keep original value, not undefined
      c: 4,
    });
  });

  it('should handle empty objects', () => {
    const result = composeOptions({}, {});

    expect(result).toEqual({});
  });

  it('should handle single object', () => {
    const obj = { a: 1, b: 2 };

    const result = composeOptions(obj);

    expect(result).toEqual(obj);
  });

  it('should handle nested objects', () => {
    const obj1 = { nested: { a: 1, b: 2 } };
    const obj2 = { nested: { b: 3, c: 4 } };

    const result = composeOptions(obj1, obj2);

    expect(result).toEqual({
      nested: {
        a: 1,
        b: 3,
        c: 4,
      },
    });
  });

  it('should handle arrays', () => {
    const obj1 = { items: [1, 2] };
    const obj2 = { items: [3, 4] };

    const result = composeOptions(obj1, obj2);

    expect(result).toEqual({
      items: [3, 4], // Arrays are replaced, not merged
    });
  });

  it('should handle null values', () => {
    const obj1 = { a: 1, b: null };
    const obj2 = { b: 2, c: null };

    const result = composeOptions(obj1, obj2);

    expect(result).toEqual({
      a: 1,
      b: 2,
      c: null,
    });
  });

  it('should handle zero values', () => {
    const obj1 = { a: 0, b: 1 };
    const obj2 = { a: 2, c: 0 };

    const result = composeOptions(obj1, obj2);

    expect(result).toEqual({
      a: 2,
      b: 1,
      c: 0,
    });
  });

  it('should handle false values', () => {
    const obj1 = { a: true, b: false };
    const obj2 = { a: false, c: true };

    const result = composeOptions(obj1, obj2);

    expect(result).toEqual({
      a: false,
      b: false,
      c: true,
    });
  });

  it('should handle empty string values', () => {
    const obj1 = { a: 'hello', b: '' };
    const obj2 = { a: '', c: 'world' };

    const result = composeOptions(obj1, obj2);

    expect(result).toEqual({
      a: '',
      b: '',
      c: 'world',
    });
  });
}); 
