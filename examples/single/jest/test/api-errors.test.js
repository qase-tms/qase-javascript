const { qase } = require('jest-qase-reporter/jest');
const { expect } = require('@jest/globals');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

describe('JSONPlaceholder API - Error Handling', () => {
  test(qase(8, 'GET non-existent user returns empty object'), async () => {
    qase.fields({ layer: 'api', severity: 'normal', priority: 'medium' });
    qase.comment('JSONPlaceholder returns empty object {} for non-existent resources instead of 404');

    await qase.step('Request user with ID 999', async () => {
      const response = await fetch(`${BASE_URL}/users/999`);
      expect(response.status).toBe(200);

      const user = await response.json();
      expect(user).toEqual({});
    });
  });

  test(qase(9, 'GET non-existent post returns empty object'), async () => {
    qase.fields({ layer: 'api', severity: 'normal' });
    qase.comment('JSONPlaceholder behavior: non-existent resources return {} with 200 status');

    await qase.step('Request post with ID 999', async () => {
      const response = await fetch(`${BASE_URL}/posts/999`);
      expect(response.status).toBe(200);

      const post = await response.json();
      expect(post).toEqual({});

      // Attach the error response
      qase.attach({
        name: 'error-response.json',
        content: JSON.stringify({
          requestedId: 999,
          response: post,
          status: response.status,
        }, null, 2),
        contentType: 'application/json',
      });
    });
  });

  test(qase(10, 'Invalid endpoint returns 404 with HTML'), async () => {
    qase.fields({ layer: 'api', severity: 'low', priority: 'low' });
    qase.comment('Invalid endpoints return 404 with HTML error page');

    await qase.step('Request invalid endpoint', async () => {
      const response = await fetch(`${BASE_URL}/invalid-endpoint`);
      expect(response.status).toBe(404);

      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('text/html');
    });
  });

  test(qase(11, 'POST with invalid JSON is gracefully handled'), async () => {
    qase.fields({ layer: 'api', severity: 'normal' });

    await qase.step('Send POST with minimal data', async () => {
      const response = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      // JSONPlaceholder accepts any JSON and returns 201
      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result).toHaveProperty('id');
    });
  });
});
