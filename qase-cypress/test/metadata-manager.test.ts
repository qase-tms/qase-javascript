/* eslint-disable */
import { describe, expect, it, beforeEach, afterAll } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { MetadataManager } from '../src/metadata/manager';
import type { StepStart } from '../src/metadata/models';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qase-cypress-metadata-'));
const originalPath = MetadataManager.metadataPath;

describe('MetadataManager', () => {
  beforeEach(() => {
    MetadataManager.metadataPath = path.join(dir, 'qaseMetadata');
    MetadataManager.clear();
  });

  afterAll(() => {
    MetadataManager.metadataPath = originalPath;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const starts = () =>
    (MetadataManager.getMetadata()?.steps ?? []).filter((s): s is StepStart => 'name' in s);

  it('keeps a step whose name repeats the first step name', () => {
    MetadataManager.addStepStart('Same');
    MetadataManager.addStepEnd('passed');
    MetadataManager.addStepStart('Other');
    MetadataManager.addStepEnd('passed');
    MetadataManager.addStepStart('Same');
    MetadataManager.addStepEnd('passed');

    expect(starts().map((s) => s.name)).toEqual(['Same', 'Other', 'Same']);
  });

  it('keeps a cucumber step whose name repeats the first step name', () => {
    MetadataManager.addCucumberStep('Given a thing');
    MetadataManager.addCucumberStep('When something');
    MetadataManager.addCucumberStep('Given a thing');

    expect(MetadataManager.getMetadata()?.cucumberSteps?.map((s) => s.name))
      .toEqual(['Given a thing', 'When something', 'Given a thing']);
  });

  it('stores the expected result and data of a step', () => {
    MetadataManager.addStepStart({ name: 'Click', expectedResult: 'Clicked', data: 'payload' });

    expect(starts()[0]).toMatchObject({ name: 'Click', expectedResult: 'Clicked', data: 'payload' });
  });

  it('does not reorder stored steps when a step ends', () => {
    MetadataManager.addStepStart('Parent');
    MetadataManager.addStepStart('Child');
    MetadataManager.addStepEnd('passed');

    const steps = MetadataManager.getMetadata()?.steps ?? [];
    expect(steps.map((s) => ('name' in s ? s.name : `end:${s.status}`))).toEqual(['Parent', 'Child', 'end:passed']);
    expect(MetadataManager.getMetadata()?.currentStepId).toBe(starts()[0]?.id);
  });

  // cy.task serialises a Buffer to { type: 'Buffer', data: [...] }.
  it('keeps the content of a Buffer attachment sent through cy.task', () => {
    const sent = JSON.parse(JSON.stringify({ name: 'buf.txt', content: Buffer.from('hello'), contentType: 'text/plain' }));
    MetadataManager.addAttach(sent);

    const content = MetadataManager.getMetadata()?.attachments?.[0]?.content;
    expect(Buffer.isBuffer(content)).toBe(true);
    expect(content?.toString()).toBe('hello');
  });

  it('keeps the content of a Buffer attachment added to a step', () => {
    MetadataManager.addStepStart('Step');
    MetadataManager.addAttach({ name: 'buf.bin', content: Buffer.from([1, 2, 3]) });

    const metadata = MetadataManager.getMetadata();
    const content = metadata?.stepAttachments?.[starts()[0]!.id]?.[0]?.content;
    expect(Buffer.isBuffer(content)).toBe(true);
    expect([...(content as Buffer)]).toEqual([1, 2, 3]);
  });

  it('keeps string attachment content as is', () => {
    MetadataManager.addAttach({ name: 's.txt', content: 'plain' });

    expect(MetadataManager.getMetadata()?.attachments?.[0]?.content).toBe('plain');
  });
});
