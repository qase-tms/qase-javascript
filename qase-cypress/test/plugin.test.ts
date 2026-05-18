/* eslint-disable */
import { expect } from '@jest/globals';

const beforeRunHookMock = jest.fn(async () => {});
const afterRunHookMock = jest.fn(async () => {});
const afterSpecHookMock = jest.fn(async () => {});

jest.mock('../src/hooks', () => ({
  beforeRunHook: beforeRunHookMock,
  afterRunHook: afterRunHookMock,
  afterSpecHook: afterSpecHookMock,
}));

jest.mock('qase-javascript-commons', () => ({
  ConfigLoader: jest.fn().mockImplementation(() => ({ load: jest.fn(() => ({})) })),
  composeOptions: jest.fn(() => ({ profilers: [] })),
}));

describe('plugin registration', () => {
  beforeEach(() => {
    jest.resetModules();
    beforeRunHookMock.mockClear();
    afterRunHookMock.mockClear();
    afterSpecHookMock.mockClear();
  });

  function loadPlugin() {
    // require fresh each test so that internal state (if any) is clean
    return require('../src/plugin.js');
  }

  it('registers an after:spec handler that calls afterSpecHook', async () => {
    const handlers: Record<string, Function> = {};
    const on = jest.fn((event: string, handler: Function) => {
      handlers[event] = handler;
    });
    const config = { reporterOptions: null, env: {} };

    const plugin = loadPlugin();
    plugin(on, config);

    expect(on).toHaveBeenCalledWith('after:spec', expect.any(Function));
    const spec = { name: 'login.cy.js', relative: 'cypress/e2e/login.cy.js' };
    await handlers['after:spec']!(spec, {});

    expect(afterSpecHookMock).toHaveBeenCalledWith(spec, config);
  });

  it('still registers before:run and after:run handlers', () => {
    const events: string[] = [];
    const on = jest.fn((event: string) => {
      events.push(event);
    });
    const plugin = loadPlugin();
    plugin(on, { reporterOptions: null, env: {} });

    expect(events).toEqual(expect.arrayContaining(['before:run', 'after:run', 'after:spec']));
  });

  it('does not throw when reporterOptions is null', () => {
    const on = jest.fn();
    const plugin = loadPlugin();
    expect(() => plugin(on, { reporterOptions: null, env: {} })).not.toThrow();
  });
});
