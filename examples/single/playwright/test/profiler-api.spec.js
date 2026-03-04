const { test } = require('playwright-qase-reporter/fixture');
const { expect } = require('@playwright/test');

test.describe('Network Profiler API Tests', () => {
  test('GET request captured by profiler', async ({}) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    expect(response.status).toBe(200);
    const user = await response.json();
    expect(user.id).toBe(1);
  });

  test('POST request captured by profiler', async ({}) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'test', body: 'test body', userId: 1 }),
    });
    expect(response.status).toBe(201);
  });

  test('Multiple requests in one test', async ({}) => {
    const r1 = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    expect(r1.status).toBe(200);
    const r2 = await fetch('https://jsonplaceholder.typicode.com/comments?postId=1');
    expect(r2.status).toBe(200);
  });
});
