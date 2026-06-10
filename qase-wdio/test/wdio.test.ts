/* eslint-disable */
import { describe, expect, it, jest } from '@jest/globals';

describe('qase.id (wdio runtime API)', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('drops zero and does not emit an event', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const emit = jest.spyOn(process, 'emit').mockImplementation(() => true);
    const { qase } = require('../src/wdio');
    qase.id(0);
    // events.addQaseID = 'qase:id'
    expect(emit).not.toHaveBeenCalledWith('qase:id', expect.anything());
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('0'));
    warn.mockRestore();
    emit.mockRestore();
  });

  it('emits only the positive IDs from a mixed list', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const emit = jest.spyOn(process, 'emit').mockImplementation(() => true);
    const { qase } = require('../src/wdio');
    qase.id([1, 0, 2]);
    expect(emit).toHaveBeenCalledWith('qase:id', { ids: [1, 2] });
    warn.mockRestore();
    emit.mockRestore();
  });

  it('does not emit when all IDs are non-positive', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const emit = jest.spyOn(process, 'emit').mockImplementation(() => true);
    const { qase } = require('../src/wdio');
    qase.id([-1, 0]);
    expect(emit).not.toHaveBeenCalledWith('qase:id', expect.anything());
    warn.mockRestore();
    emit.mockRestore();
  });

  it('emits positive ID without filtering', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const emit = jest.spyOn(process, 'emit').mockImplementation(() => true);
    const { qase } = require('../src/wdio');
    qase.id(42);
    expect(emit).toHaveBeenCalledWith('qase:id', { ids: [42] });
    warn.mockRestore();
    emit.mockRestore();
  });
});
