const { add, mul, sub, div } = require('./arith');
const { qase } = require('jest-qase-reporter/dist/jest');

describe('Qase base suite', () => {
  describe("Parametrized creation of test cases", () => {
    test('should return proper result with arguments(3, 4)', async () => {
      await new Promise((r) => setTimeout(r, 2000));
      expect(mul(3, 4)).toBe(12);
    });

    test.each([
      [3, 4, 12],
      [0, 0, 0],
      [100, 0, 0],
      [0, 100, 0],
      [1, 1, 1]
    ])(
      `should return proper result when passed arguments are: %i, %i`,
      (x, y, result) => {
        expect(mul(x, y)).toBe(result)
      }
    );

    test.skip('Skipped test', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('Demo test', () => {
      expect(add(2, 3)).toBe(6);
    });

    test('New test case to check RunID', () => {
      expect(add(2, 3)).toBe(6);
    });
  })

  describe("Echo describe", () => {
    test('Echo demo', () => {
      expect(add(2, 3)).toBe(5);
    });
    test('exclude 0 level suite', () => {
      expect(add(2, 3)).toBe(5);
    });

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

      describe("getSuitesWithLevels", () => {
        describe("skipped", () => {

          test.skip('exclude 0 level suite', () => {
            expect(add(2, 3)).toBe(5);
          });

          test.skip('exclude 2 level suite', async () => {
            await new Promise((r) => setTimeout(r, 2000));
            expect(mul(3, 4)).toBe(12);
          });

          test.skip('without exclude', () => {
            expect(div(8, 4)).toBe(2);
          });

          test.skip('New test case', () => {
            expect(add(2, 3)).toBe(5);
          });

          test.skip('Echo demo', () => {
            expect(add(2, 3)).toBe(6);
          });
        })
      })
    })
  })
})

describe('Parametrized creation of test suits', () => {
  describe.each([
    [0, 0, 0],
    [1, 2, 3],
    [-1, -1, -2],
    [100, -100, 0]
  ])(`add(%i, %i) function`, (x, y, result) => {
    test(`should return ${result}`, () => {
      expect(add(x, y).toBe(result))
    })
  })
})

describe('Second root suite', () => {
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
    test('exclude 0 level suite', () => {
      expect(add(2, 3)).toBe(5);
    });

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

        describe("skipped", () => {

          test.skip('exclude 0 level suite', () => {
            expect(add(2, 3)).toBe(5);
          });

          test.skip('exclude 2 level suite', async () => {
            await new Promise((r) => setTimeout(r, 2000));
            expect(mul(3, 4)).toBe(12);
          });

          test.skip('without exclude', () => {
            expect(div(8, 4)).toBe(2);
          });

          test.skip('New test case', () => {
            expect(add(2, 3)).toBe(5);
          });

          test.skip('Echo demo', () => {
            expect(add(2, 3)).toBe(6);
          });
        })
      })
    })
  })
})
