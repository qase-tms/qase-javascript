const { qase } = require('mocha-qase-reporter/mocha');
const assert = require('assert');

describe('JSONPlaceholder Error Handling', function() {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  it(qase(8, 'GET non-existent user - verify 404 response'), async function() {
    qase.comment('Testing error handling for non-existent resource - this is an expected failure scenario');

    const nonExistentUserId = 9999;
    let response;

    await qase.step(`Send GET request to /users/${nonExistentUserId}`, async () => {
      response = await fetch(`${BASE_URL}/users/${nonExistentUserId}`);
    });

    await qase.step('Verify response status is 404 (Not Found)', async () => {
      assert.strictEqual(
        response.status,
        404,
        'Should return 404 for non-existent user'
      );
    });

    await qase.step('Verify response body is empty object', async () => {
      const body = await response.json();
      assert.strictEqual(typeof body, 'object', 'Response should be an object');
      assert.strictEqual(Object.keys(body).length, 0, 'Response should be empty for 404');
    });
  });

  it(qase(9, 'GET non-existent post - attach error response'), async function() {
    const nonExistentPostId = 99999;
    let response;
    let errorBody;

    await qase.step(`Send GET request to /posts/${nonExistentPostId}`, async () => {
      response = await fetch(`${BASE_URL}/posts/${nonExistentPostId}`);
    });

    await qase.step('Verify response status is 404', async () => {
      assert.strictEqual(response.status, 404);
    });

    await qase.step('Parse error response', async () => {
      errorBody = await response.json();
    });

    await qase.step('Attach error response for documentation', async () => {
      qase.attach({
        name: '404-error-response.json',
        content: JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          url: response.url
        }, null, 2),
        contentType: 'application/json'
      });
    });

    await qase.step('Verify error response structure', async () => {
      assert.strictEqual(typeof errorBody, 'object', 'Error body should be an object');
    });
  });

  it(qase(10, 'Invalid endpoint - verify graceful 404 handling'), async function() {
    const invalidEndpoint = '/invalid-endpoint-12345';
    let response;

    await qase.step(`Send GET request to invalid endpoint: ${invalidEndpoint}`, async () => {
      response = await fetch(`${BASE_URL}${invalidEndpoint}`);
    });

    await qase.step('Verify response status is 404', async () => {
      assert.strictEqual(
        response.status,
        404,
        'Invalid endpoint should return 404'
      );
    });

    await qase.step('Verify API handles invalid endpoint gracefully', async () => {
      // Should not throw error, just return 404
      assert.ok(response, 'Response should exist even for invalid endpoint');
      assert.strictEqual(response.ok, false, 'Response should not be ok for 404');
    });

    await qase.step('Verify can still parse response body', async () => {
      const body = await response.json();
      assert.strictEqual(typeof body, 'object', 'Should return object even for error');
    });
  });
});
