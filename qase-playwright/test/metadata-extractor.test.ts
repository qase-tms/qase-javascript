/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { TestResult } from '@playwright/test/reporter';
import { MetadataExtractor } from '../src/metadata-extractor';
import { StepIndex } from '../src/step-index';
import { ReporterContentType } from '../src/playwright';

const PROFILER_CONTENT_TYPE = 'application/qase.profiler-steps+json';

function makeMetadataAttachment(payload: object): TestResult['attachments'][number] {
  return {
    name: 'qase-metadata',
    contentType: ReporterContentType,
    body: Buffer.from(JSON.stringify(payload)),
  } as any;
}

describe('MetadataExtractor', () => {
  let stepIndex: StepIndex;
  let extractor: MetadataExtractor;

  beforeEach(() => {
    stepIndex = new StepIndex();
    extractor = new MetadataExtractor(stepIndex);
  });

  it('returns defaults when no attachments are provided', () => {
    const m = extractor.transform([]);
    expect(m).toEqual({
      ids: [],
      title: '',
      fields: {},
      parameters: {},
      groupParams: {},
      attachments: [],
      ignore: false,
      suite: '',
      comment: '',
      tags: [],
    });
  });

  it('parses ids/title/fields/parameters from a qase-metadata attachment', () => {
    const m = extractor.transform([
      makeMetadataAttachment({
        ids: [1, 2],
        title: 'override',
        fields: { severity: 'major' },
        parameters: { browser: 'chrome' },
      }),
    ]);
    expect(m.ids).toEqual([1, 2]);
    expect(m.title).toBe('override');
    expect(m.fields).toEqual({ severity: 'major' });
    expect(m.parameters).toEqual({ browser: 'chrome' });
  });

  it('parses ignore/suite/comment/groupParams', () => {
    const m = extractor.transform([
      makeMetadataAttachment({ ignore: true, suite: 'mySuite', comment: 'note', groupParams: { region: 'eu' } }),
    ]);
    expect(m.ignore).toBe(true);
    expect(m.suite).toBe('mySuite');
    expect(m.comment).toBe('note');
    expect(m.groupParams).toEqual({ region: 'eu' });
  });

  it('parses projectMapping when payload is an object', () => {
    const m = extractor.transform([
      makeMetadataAttachment({ projectMapping: { PROJ: [1, 2] } }),
    ]);
    expect(m.projectMapping).toEqual({ PROJ: [1, 2] });
  });

  it('appends tags to the existing list', () => {
    const m = extractor.transform([
      makeMetadataAttachment({ tags: ['a', 'b'] }),
    ]);
    expect(m.tags).toEqual(['a', 'b']);
  });

  it('skips profiler-content attachments (handled separately by ResultBuilder)', () => {
    const m = extractor.transform([
      { name: 'profiler.json', contentType: PROFILER_CONTENT_TYPE, body: Buffer.from('[]') } as any,
    ]);
    expect(m.attachments).toEqual([]);
  });

  it('routes step_attach_body_<uuid>_<name> attachments to the parent step in StepIndex', () => {
    const parentStep = { title: 'parent' } as any;
    const childStep = {
      title: 'step_attach_body_12345678-1234-1234-1234-123456789012_inline.txt',
      parent: parentStep,
    } as any;
    stepIndex.cacheStep(childStep, {} as any);
    extractor.transform([
      {
        name: 'step_attach_body_12345678-1234-1234-1234-123456789012_inline.txt',
        contentType: 'text/plain',
        body: Buffer.from('hello'),
      } as any,
    ]);
    const attached = stepIndex.getStepAttachments(parentStep);
    expect(attached).toHaveLength(1);
    expect(attached?.[0]?.file_name).toBe('inline.txt');
    expect(attached?.[0]?.content).toBeInstanceOf(Buffer);
  });

  it('routes step_attach_file_<uuid>_<name> attachments with file_path set', () => {
    const parentStep = { title: 'parent' } as any;
    const childStep = {
      title: 'step_attach_file_12345678-1234-1234-1234-123456789012_screenshot.png',
      parent: parentStep,
    } as any;
    stepIndex.cacheStep(childStep, {} as any);
    extractor.transform([
      {
        name: 'step_attach_file_12345678-1234-1234-1234-123456789012_screenshot.png',
        contentType: 'image/png',
        body: Buffer.from('/tmp/x.png'),
      } as any,
    ]);
    const attached = stepIndex.getStepAttachments(parentStep);
    expect(attached?.[0]?.file_name).toBe('screenshot.png');
    expect(attached?.[0]?.file_path).toBe('/tmp/x.png');
  });

  it('treats a regular attachment as a test-level attachment', () => {
    const m = extractor.transform([
      { name: 'screenshot.png', contentType: 'image/png', path: '/tmp/x.png', body: undefined } as any,
    ]);
    expect(m.attachments).toHaveLength(1);
    expect(m.attachments[0]?.file_name).toBe('x.png');
    expect(m.attachments[0]?.file_path).toBe('/tmp/x.png');
  });

  it('falls back to attachment.name when path is missing', () => {
    const m = extractor.transform([
      { name: 'inline.txt', contentType: 'text/plain', body: Buffer.from('data') } as any,
    ]);
    expect(m.attachments).toHaveLength(1);
    expect(m.attachments[0]?.file_name).toBe('inline.txt');
  });
});
