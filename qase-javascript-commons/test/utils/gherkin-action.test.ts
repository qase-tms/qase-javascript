import { describe, expect, it } from '@jest/globals';
import { gherkinAction } from '../../src/utils/gherkin-action';

describe('gherkinAction', () => {
  it('joins the keyword and the step text', () => {
    expect(gherkinAction('Given', 'a user')).toBe('Given a user');
  });

  it('uses the text alone when there is no keyword', () => {
    expect(gherkinAction('', 'a user')).toBe('a user');
  });

  it('uses the keyword alone when there is no text', () => {
    expect(gherkinAction('Given a user', undefined)).toBe('Given a user');
  });

  it('does not repeat the text when an older reporter put it in the keyword too', () => {
    expect(gherkinAction('a user', 'a user')).toBe('a user');
  });
});
