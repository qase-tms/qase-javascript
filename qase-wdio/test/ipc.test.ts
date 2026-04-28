/* eslint-disable */
import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { TestStepType } from 'qase-javascript-commons';
import { IpcBridge } from '../src/ipc';
import { MetadataApplier } from '../src/metadata';
import { Storage } from '../src/storage';
import { events } from '../src/events';

describe('IpcBridge', () => {
  let metadata: MetadataApplier;
  let bridge: IpcBridge;

  beforeEach(() => {
    metadata = new MetadataApplier(new Storage());
    bridge = new IpcBridge(metadata);
    bridge.registerListeners();
  });

  afterEach(() => {
    process.removeAllListeners(events.addQaseID);
    process.removeAllListeners(events.addTitle);
    process.removeAllListeners(events.addFields);
    process.removeAllListeners(events.addSuite);
    process.removeAllListeners(events.addParameters);
    process.removeAllListeners(events.addGroupParameters);
    process.removeAllListeners(events.addComment);
    process.removeAllListeners(events.addAttachment);
    process.removeAllListeners(events.addIgnore);
    process.removeAllListeners(events.addStep);
    process.removeAllListeners(events.addTags);
    process.removeAllListeners(events.addProfilerSteps);
  });

  it('routes addQaseID events to MetadataApplier.addQaseId', () => {
    const spy = jest.spyOn(metadata, 'addQaseId');
    process.emit(events.addQaseID as any, { ids: [7] } as any);
    expect(spy).toHaveBeenCalledWith({ ids: [7] });
  });

  it('buffers addProfilerSteps payloads (valid JSON of TestStepType[])', () => {
    const step = { id: 's' } as unknown as TestStepType;
    process.emit(events.addProfilerSteps as any, JSON.stringify([step]) as any);
    expect(bridge.drainProfilerSteps()).toEqual([step]);
  });

  it('silently ignores corrupted addProfilerSteps payloads', () => {
    process.emit(events.addProfilerSteps as any, 'not json' as any);
    expect(bridge.drainProfilerSteps()).toEqual([]);
  });

  it('drainProfilerSteps clears the buffer', () => {
    const step = { id: 's' } as unknown as TestStepType;
    process.emit(events.addProfilerSteps as any, JSON.stringify([step]) as any);
    bridge.drainProfilerSteps();
    expect(bridge.drainProfilerSteps()).toEqual([]);
  });
});
