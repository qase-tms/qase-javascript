import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe("Error Handling", () => {
  test("GET non-existent user (404) - verify error status", withQase(async ({ qase }) => {
    await qase.title("Verify API returns 404 for non-existent user");
    await qase.fields({ layer: 'api', severity: 'normal', priority: 'medium' });
    await qase.parameters({ userId: 999 });
    await qase.comment("Expected failure: User ID 999 does not exist in JSONPlaceholder database");

    await qase.step("Send GET request to /users/999", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/999');
      expect(response.status).toBe(404);
    });

    await qase.step("Verify empty response body", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/999');
      const data = await response.json();

      // JSONPlaceholder returns empty object for non-existent resources
      expect(data).toEqual({});
    });

    await qase.step("Document expected 404 behavior", async () => {
      await qase.comment("JSONPlaceholder correctly handles non-existent resources with 404 status");
    });
  }));

  test("GET non-existent post (404) - attach error response", withQase(async ({ qase }) => {
    await qase.title("Verify API returns 404 for non-existent post");
    await qase.fields({ layer: 'api', severity: 'normal' });
    await qase.parameters({ postId: 9999 });

    let errorResponse: any;

    await qase.step("Send GET request to non-existent post", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/9999');
      expect(response.status).toBe(404);

      errorResponse = await response.json();
    });

    await qase.step("Attach error response for debugging", async () => {
      await qase.attach({
        name: '404-error-response.json',
        content: JSON.stringify(errorResponse, null, 2),
        type: 'application/json'
      });
    });

    await qase.step("Verify error response structure", async () => {
      // JSONPlaceholder returns empty object for 404
      expect(errorResponse).toEqual({});
    });
  }));

  test("GET invalid endpoint (404) - verify graceful handling", withQase(async ({ qase }) => {
    await qase.title("Verify API handles invalid endpoints gracefully");
    await qase.fields({ layer: 'api', severity: 'normal' });

    await qase.step("Send request to invalid endpoint", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/invalid-endpoint');
      expect(response.status).toBe(404);
    });

    await qase.step("Verify no server error", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/invalid-endpoint');

      // Should be 404, not 500 - graceful handling
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(404);
    });

    await qase.step("Document graceful failure", async () => {
      await qase.comment("API correctly returns 404 for invalid endpoints without server errors");
    });
  }));
});
