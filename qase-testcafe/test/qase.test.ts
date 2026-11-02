import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { qase } from '../src/qase';

describe('qase without the qase reporter', () => {
  it('runs the step body', async () => {
    let ran = false;
    await qase.step('step', () => {
      ran = true;
    });
    expect(ran).toBe(true);
  });

  it('ignores attachments', () => {
    expect(() => qase.attach({ name: 'a.txt', content: 'a' })).not.toThrow();
    expect(() => qase.attach({ paths: ['/tmp/a.txt'] })).not.toThrow();
  });
});

describe('qase.attach', () => {
  const attachment = jest.fn();

  beforeEach(() => {
    // @ts-expect-error - global.Qase is dynamically added at runtime
    global.Qase = { attachment };
  });

  afterEach(() => {
    attachment.mockReset();
    // @ts-expect-error - global.Qase is dynamically added at runtime
    delete global.Qase;
  });

  it('accepts a single path as a string', () => {
    qase.attach({ paths: '/tmp/dir/report.png' });
    expect(attachment).toHaveBeenCalledTimes(1);
    expect(attachment).toHaveBeenCalledWith(
      expect.objectContaining({ file_path: '/tmp/dir/report.png', file_name: 'report.png', mime_type: 'image/png' }),
      null,
    );
  });

  it('accepts an array of paths', () => {
    qase.attach({ paths: ['/tmp/a.txt', '/tmp/b.png'] });
    expect(attachment).toHaveBeenCalledTimes(2);
  });

  it('reads the mime type from contentType', () => {
    qase.attach({ name: 'a.json', content: '{}', contentType: 'application/json' });
    expect(attachment).toHaveBeenCalledWith(
      expect.objectContaining({ file_name: 'a.json', mime_type: 'application/json' }),
      null,
    );
  });

  it('still reads the mime type from type', () => {
    qase.attach({ name: 'a.txt', content: 'a', type: 'text/plain' });
    expect(attachment).toHaveBeenCalledWith(expect.objectContaining({ mime_type: 'text/plain' }), null);
  });
});
