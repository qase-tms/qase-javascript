/* eslint-disable */
import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { Readable } from 'stream';
import { QaseWdioService } from '../src/service';
import { events } from '../src/events';

jest.mock('qase-javascript-commons', () => ({
  ...(jest.requireActual('qase-javascript-commons') as object),
  ConfigLoader: jest.fn().mockImplementation(() => ({ load: () => ({}) })),
}));

function makeProfiler() {
  let allSteps: object[] = [];
  return {
    enable: jest.fn(),
    restore: jest.fn(),
    getAllSteps: jest.fn(() => allSteps),
    appendStep: (s: object) => { allSteps = [...allSteps, s]; },
  };
}

function makeWorld() {
  const attach = jest.fn();
  return { world: { attach } as { attach: (...args: any[]) => unknown }, original: attach };
}

describe('QaseWdioService', () => {
  let attachments: any[];
  let profilerSteps: string[];
  const onAttach = (a: any) => attachments.push(a);
  const onSteps = (s: string) => profilerSteps.push(s);

  beforeEach(() => {
    attachments = [];
    profilerSteps = [];
    process.on(events.addAttachment as any, onAttach);
    process.on(events.addProfilerSteps as any, onSteps);
  });

  afterEach(() => {
    process.removeListener(events.addAttachment as any, onAttach);
    process.removeListener(events.addProfilerSteps as any, onSteps);
  });

  describe('network profiler in Cucumber', () => {
    it('sends the steps recorded during a scenario', () => {
      const service = new QaseWdioService();
      const profiler = makeProfiler();
      (service as any).profiler = profiler;
      profiler.appendStep({ id: 'before' });

      service.beforeScenario({}, makeWorld().world);
      profiler.appendStep({ id: 'in-scenario' });
      service.afterScenario();

      expect(profilerSteps.map((s) => JSON.parse(s))).toEqual([[{ id: 'in-scenario' }]]);
    });
  });

  describe('Cucumber World attach', () => {
    let service: QaseWdioService;

    beforeEach(() => {
      service = new QaseWdioService();
    });

    it('still calls the original attach', () => {
      const { world, original } = makeWorld();
      service.beforeScenario({}, world);
      world.attach('text', 'text/plain');
      expect(original).toHaveBeenCalledWith('text', 'text/plain');
    });

    it('forwards a string as text/plain by default', () => {
      const { world } = makeWorld();
      service.beforeScenario({}, world);
      world.attach('plain text');
      expect(attachments).toHaveLength(1);
      expect(attachments[0].type).toBe('text/plain');
      expect(attachments[0].name).toBe('attachment.txt');
      expect(Buffer.from(attachments[0].content).toString()).toBe('plain text');
    });

    it('uses the media type and file name from the options', () => {
      const { world } = makeWorld();
      service.beforeScenario({}, world);
      world.attach(Buffer.from('png'), { mediaType: 'image/png', fileName: 'shot.png' });
      expect(attachments[0]).toEqual({ name: 'shot.png', type: 'image/png', content: Buffer.from('png') });
    });

    it('names an attachment without a file name by its media type', () => {
      const { world } = makeWorld();
      service.beforeScenario({}, world);
      world.attach('{"a":1}', 'application/json');
      expect(attachments[0].name).toBe('attachment.json');
      expect(attachments[0].type).toBe('application/json');
    });

    it('decodes base64: strings', () => {
      const { world } = makeWorld();
      service.beforeScenario({}, world);
      world.attach(Buffer.from('hello').toString('base64'), 'base64:text/plain');
      expect(attachments[0].type).toBe('text/plain');
      expect(Buffer.from(attachments[0].content).toString()).toBe('hello');
    });

    it('forwards a stream once it has ended', async () => {
      const { world } = makeWorld();
      service.beforeScenario({}, world);
      const stream = Readable.from([Buffer.from('ab'), Buffer.from('cd')]);
      world.attach(stream, 'text/plain');
      stream.resume();
      await new Promise((r) => stream.on('end', r));
      expect(Buffer.from(attachments[0].content).toString()).toBe('abcd');
    });

    it('does nothing when the hook has no World', () => {
      expect(() => service.beforeScenario({}, undefined)).not.toThrow();
    });
  });
});
