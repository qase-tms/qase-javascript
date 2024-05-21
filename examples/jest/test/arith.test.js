import { describe, test, expect } from '@jest/globals';

const { qase } = require('jest-qase-reporter/jest');

describe.skip('My First Test', () => {
  test(qase([425, 430], 'Several ids'), () => {
    expect(true).toBe(true);
  });

  test(qase(426, 'Correct test'), () => {
    expect(true).toBe(true);
  });

  test.skip(qase('427', 'Skipped test'), () => {
    expect(true).toBe(true);
  });

  test(qase(['480', '482'], 'Failed test'), () => {
    expect(true).toBe(false);
  });
});


describe('My Second Test', () => {
  test(qase(428, 'Correct test'), () => {
    expect(true).toBe(true);
  });

  test(qase(429, 'Correct test'), () => {
    expect(true).toBe(true);
  });
});
