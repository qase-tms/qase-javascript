import { describe, expect, it } from '@jest/globals';
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
