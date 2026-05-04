/* eslint-disable */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { IterationDataParser } from '../src/modules/iterationDataParser';

describe('IterationDataParser.parse', () => {
  let parser: IterationDataParser;

  beforeEach(() => {
    parser = new IterationDataParser();
  });

  it('returns [] for null', () => {
    expect(parser.parse(null)).toEqual([]);
  });

  it('returns [] for undefined', () => {
    expect(parser.parse(undefined)).toEqual([]);
  });

  it('returns [] for non-array input', () => {
    expect(parser.parse({ foo: 'bar' })).toEqual([]);
    expect(parser.parse('string')).toEqual([]);
    expect(parser.parse(42)).toEqual([]);
  });

  it('returns [] for array containing non-objects', () => {
    expect(parser.parse([1, 2, 3])).toEqual([]);
    expect(parser.parse([{ a: 1 }, 'oops'])).toEqual([]);
  });

  it('flattens flat object array with lowercased keys', () => {
    expect(parser.parse([{ Foo: 'bar', Baz: 42 }])).toEqual([{ foo: 'bar', baz: '42' }]);
  });

  it('flattens nested object using dot notation in keys', () => {
    expect(parser.parse([{ a: { b: { c: 'leaf' } } }])).toEqual([{ 'a.b.c': 'leaf' }]);
  });

  it('preserves multiple iterations', () => {
    expect(parser.parse([{ x: 1 }, { x: 2 }])).toEqual([{ x: '1' }, { x: '2' }]);
  });

  it('stringifies primitive leaf values', () => {
    expect(parser.parse([{ a: true, b: 0, c: null }])).toEqual([{ a: 'true', b: '0', c: 'null' }]);
  });

  it('handles empty objects in iterations', () => {
    expect(parser.parse([{}, { a: 1 }])).toEqual([{}, { a: '1' }]);
  });

  it('handles arrays as leaves (stringifies via String())', () => {
    expect(parser.parse([{ tags: ['a', 'b'] }])).toEqual([{ tags: 'a,b' }]);
  });
});
