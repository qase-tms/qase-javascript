const { add, mul, sub, div } = require('./arith');
const { qase } = require('jest-qase-reporter/dist/jest');

describe("help", () => {

  test(qase(1, '2 + 3 = 5'), () => {
    expect(add(2, 3)).toBe(5);
  });

  test(qase(2, '3 * 4 = 12'), async () => {
    await new Promise((r) => setTimeout(r, 2000));
    expect(mul(3, 4)).toBe(12);
  });

  describe("me", () => {

    test(qase([3, 4], '5 - 6 = -1'), () => {
      expect(sub(5, 6)).toBe(-1);
    });

    test('5 - 6 = -1', () => {
      expect(sub(5, 6)).toBe(-1);
    });
  })

  test('8 / 4 = 2', () => {
    expect(div(8, 4)).toBe(2);
  });

})
