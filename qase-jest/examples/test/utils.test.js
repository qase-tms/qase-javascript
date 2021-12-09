const { add, mul, sub, div } = require('./arith');
const { qase } = require('jest-qase-reporter/dist/jest');

describe('Main utils tests', () => {
  describe("getSuitesWithLevels", () => {
  
    test('exclude 0 level suite', () => {
      expect(add(2, 3)).toBe(5);
    });
  
    test('exclude 2 level suite', async () => {
      await new Promise((r) => setTimeout(r, 2000));
      expect(mul(3, 4)).toBe(12);
    });
  
    test('without exclude', () => {
      expect(div(8, 4)).toBe(2);
    });

    test.skip('New test case', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('Echo demo', () => {
      expect(add(2, 3)).toBe(6);
    });
  })

  describe("Echo describe", () => {
    test('Echo demo', () => {
      expect(add(2, 3)).toBe(5);
    });
  })
})
