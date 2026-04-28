/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { AnnotationExtractor } from '../src/annotation-extractor';

describe('AnnotationExtractor', () => {
  let extractor: AnnotationExtractor;

  beforeEach(() => {
    extractor = new AnnotationExtractor();
  });

  describe('extractQaseIds', () => {
    it('returns an empty array when no qaseId annotations are present', () => {
      expect(extractor.extractQaseIds([{ type: 'tag', description: 'smoke' }])).toEqual([]);
    });

    it('parses a single id', () => {
      expect(extractor.extractQaseIds([{ type: 'qaseId', description: '7' }])).toEqual([7]);
    });

    it('parses a comma-separated list', () => {
      expect(extractor.extractQaseIds([{ type: 'qaseId', description: '1,2,3' }])).toEqual([1, 2, 3]);
    });

    it('is case-insensitive on the annotation type', () => {
      expect(extractor.extractQaseIds([{ type: 'QASEID', description: '42' }])).toEqual([42]);
    });
  });

  describe('extractProjectMapping', () => {
    it('returns null when no qaseProjects annotation is present', () => {
      expect(extractor.extractProjectMapping([{ type: 'qaseId', description: '1' }])).toBeNull();
    });

    it('parses a valid JSON description', () => {
      expect(
        extractor.extractProjectMapping([{ type: 'qaseProjects', description: '{"PROJ1":[1],"PROJ2":[2]}' }]),
      ).toEqual({ PROJ1: [1], PROJ2: [2] });
    });

    it('returns null on invalid JSON', () => {
      expect(
        extractor.extractProjectMapping([{ type: 'qaseProjects', description: 'not json' }]),
      ).toBeNull();
    });
  });

  describe('extractSuite', () => {
    it('collects qaseSuite descriptions in order', () => {
      expect(
        extractor.extractSuite([
          { type: 'qaseSuite', description: 'A' },
          { type: 'qaseSuite', description: 'B' },
        ]),
      ).toEqual(['A', 'B']);
    });
  });
});
