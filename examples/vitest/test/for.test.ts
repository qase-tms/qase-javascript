import { withQase } from "vitest-qase-reporter/vitest";
import { describe, it, expect } from "vitest";

describe("For loop example", () => {
  it.for([
    { id: 100, name: "Should be true" },
    { id: 200, name: "Should be false" },
  ])(
    "Should be true (Qase ID: $id)",
    ((params: { id: number; name: string }, context: { annotate: any }) => {
      const testFn = withQase<[{ id: number; name: string }]>(async ({ qase, name }) => {
        console.log(name);

        await qase.step(name, () => {
          expect(true).toBe(true);
        });

        await qase.step(name, () => {
          expect(false).toBe(true);
        });
      });
      // Combine params from it.for with Vitest context
      return testFn({ ...params, annotate: context.annotate });
    }) as any
  );
});
