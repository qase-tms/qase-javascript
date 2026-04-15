/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/require-await, @typescript-eslint/unbound-method */
import { expect } from '@jest/globals';
import {
  FallbackCoordinator,
} from '../../../src/reporters/shared/fallback-coordinator';
import { InternalReporterInterface } from '../../../src/reporters';
import { LoggerInterface } from '../../../src/utils/logger';

const silentLogger = (): jest.Mocked<LoggerInterface> => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

const makeReporter = (): jest.Mocked<InternalReporterInterface> => ({
  addTestResult: jest.fn(),
  publish: jest.fn(),
  startTestRun: jest.fn(),
  getTestResults: jest.fn().mockReturnValue([]),
  setTestResults: jest.fn(),
  sendResults: jest.fn(),
  complete: jest.fn(),
  uploadAttachment: jest.fn(),
});

describe('FallbackCoordinator', () => {
  it('runs upstream when both reporters succeed', async () => {
    const upstream = makeReporter();
    const fallback = makeReporter();
    upstream.publish.mockResolvedValue(undefined);

    const coord = new FallbackCoordinator(silentLogger(), upstream, fallback);
    await coord.run(r => r.publish(), 'publish');

    expect(upstream.publish).toHaveBeenCalledTimes(1);
    expect(fallback.publish).not.toHaveBeenCalled();
    expect(coord.isUsingFallback()).toBe(false);
    expect(coord.isDisabled()).toBe(false);
  });

  it('switches to fallback when upstream throws', async () => {
    const upstream = makeReporter();
    const fallback = makeReporter();
    upstream.publish.mockRejectedValue(new Error('boom'));
    upstream.getTestResults.mockReturnValue([{ id: 'x' } as any]);
    fallback.publish.mockResolvedValue(undefined);

    const coord = new FallbackCoordinator(silentLogger(), upstream, fallback);
    await coord.run(r => r.publish(), 'publish');

    expect(fallback.setTestResults).toHaveBeenCalledWith([{ id: 'x' }]);
    expect(fallback.publish).toHaveBeenCalledTimes(1);
    expect(coord.isUsingFallback()).toBe(true);
    expect(coord.isDisabled()).toBe(false);
  });

  it('disables when upstream fails and no fallback is configured', async () => {
    const upstream = makeReporter();
    upstream.publish.mockRejectedValue(new Error('boom'));

    const coord = new FallbackCoordinator(silentLogger(), upstream, undefined);
    await coord.run(r => r.publish(), 'publish');

    expect(coord.isDisabled()).toBe(true);
    expect(coord.isUsingFallback()).toBe(false);
  });

  it('disables when both upstream and fallback fail', async () => {
    const upstream = makeReporter();
    const fallback = makeReporter();
    upstream.publish.mockRejectedValue(new Error('boom-up'));
    fallback.publish.mockRejectedValue(new Error('boom-fb'));

    const coord = new FallbackCoordinator(silentLogger(), upstream, fallback);
    await coord.run(r => r.publish(), 'publish');

    expect(coord.isDisabled()).toBe(true);
  });

  it('skips upstream entirely once using fallback', async () => {
    const upstream = makeReporter();
    const fallback = makeReporter();
    upstream.publish.mockRejectedValueOnce(new Error('boom'));
    fallback.publish.mockResolvedValue(undefined);

    const coord = new FallbackCoordinator(silentLogger(), upstream, fallback);
    await coord.run(r => r.publish(), 'publish'); // triggers switch
    await coord.run(r => r.publish(), 'publish'); // second call hits fallback only

    expect(upstream.publish).toHaveBeenCalledTimes(1);
    expect(fallback.publish).toHaveBeenCalledTimes(2);
  });

  it('is a no-op when disabled', async () => {
    const upstream = makeReporter();
    const coord = new FallbackCoordinator(silentLogger(), upstream, undefined);
    coord.setDisabled(true);

    await coord.run(r => r.publish(), 'publish');

    expect(upstream.publish).not.toHaveBeenCalled();
  });

  it('invokes lifecycle callbacks', async () => {
    const upstream = makeReporter();
    const fallback = makeReporter();
    upstream.publish.mockRejectedValue(new Error('boom'));
    fallback.publish.mockResolvedValue(undefined);

    const onUpstream = jest.fn();
    const onActivated = jest.fn();

    const coord = new FallbackCoordinator(silentLogger(), upstream, fallback, {
      onUpstreamFailure: onUpstream,
      onFallbackActivated: onActivated,
    });
    await coord.run(r => r.publish(), 'publish');

    expect(onUpstream).toHaveBeenCalledTimes(1);
    expect(onActivated).toHaveBeenCalledTimes(1);
  });

  it('returns the upstream result on success', async () => {
    const upstream = makeReporter();
    upstream.uploadAttachment.mockResolvedValue('hash-123');

    const coord = new FallbackCoordinator(silentLogger(), upstream, undefined);
    const result = await coord.run(r => r.uploadAttachment({} as any), 'upload');

    expect(result).toBe('hash-123');
  });

  describe('reset', () => {
    it('clears disabled and useFallback flags', async () => {
      const upstream = makeReporter();
      upstream.publish.mockRejectedValue(new Error('boom'));

      const coord = new FallbackCoordinator(silentLogger(), upstream, undefined);
      await coord.run(r => r.publish(), 'publish');
      expect(coord.isDisabled()).toBe(true);

      coord.reset();
      expect(coord.isDisabled()).toBe(false);
      expect(coord.isUsingFallback()).toBe(false);
    });
  });

  describe('undefined upstream with fallback', () => {
    it('routes run() to fallback without copying results', async () => {
      const fallback = makeReporter();
      fallback.publish.mockResolvedValue(undefined);

      const coord = new FallbackCoordinator(silentLogger(), undefined, fallback);
      await coord.run(r => r.publish(), 'publish');

      expect(fallback.publish).toHaveBeenCalledTimes(1);
      expect(fallback.setTestResults).not.toHaveBeenCalled();
      expect(coord.isUsingFallback()).toBe(true);
    });

    it('disables when both upstream and fallback are undefined', async () => {
      const coord = new FallbackCoordinator(silentLogger(), undefined, undefined);
      const result = await coord.run(r => r.publish(), 'publish');

      expect(result).toBeUndefined();
    });
  });

  describe('onDisabled callback', () => {
    it('fires once when upstream fails and no fallback is configured', async () => {
      const upstream = makeReporter();
      upstream.publish.mockRejectedValue(new Error('boom'));
      const onDisabled = jest.fn();

      const coord = new FallbackCoordinator(silentLogger(), upstream, undefined, { onDisabled });
      await coord.run(r => r.publish(), 'publish');
      await coord.run(r => r.publish(), 'publish'); // second call should not re-fire

      expect(onDisabled).toHaveBeenCalledTimes(1);
    });

    it('fires once when both upstream and fallback fail', async () => {
      const upstream = makeReporter();
      const fallback = makeReporter();
      upstream.publish.mockRejectedValue(new Error('boom-up'));
      fallback.publish.mockRejectedValue(new Error('boom-fb'));
      const onDisabled = jest.fn();

      const coord = new FallbackCoordinator(silentLogger(), upstream, fallback, { onDisabled });
      await coord.run(r => r.publish(), 'publish');

      expect(onDisabled).toHaveBeenCalledTimes(1);
    });

    it('does not fire when setDisabled(true) is called manually', async () => {
      const upstream = makeReporter();
      const onDisabled = jest.fn();

      const coord = new FallbackCoordinator(silentLogger(), upstream, undefined, { onDisabled });
      coord.setDisabled(true);

      expect(onDisabled).not.toHaveBeenCalled();
    });

    it('does not re-fire after reset() + new failure', async () => {
      const upstream = makeReporter();
      upstream.publish.mockRejectedValue(new Error('boom'));
      const onDisabled = jest.fn();

      const coord = new FallbackCoordinator(silentLogger(), upstream, undefined, { onDisabled });
      await coord.run(r => r.publish(), 'publish');
      coord.reset();
      await coord.run(r => r.publish(), 'publish');

      expect(onDisabled).toHaveBeenCalledTimes(1);
    });
  });
});
