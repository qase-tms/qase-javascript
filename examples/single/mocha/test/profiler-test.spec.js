const assert = require('assert');

describe('Network Profiler Test', function() {
  it('GET request should be intercepted by profiler', async function() {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    assert.strictEqual(response.status, 200);
    const user = await response.json();
    assert.strictEqual(user.id, 1);
  });

  it('POST request should be intercepted by profiler', async function() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'test', body: 'test body', userId: 1 })
    });
    assert.strictEqual(response.status, 201);
  });

  it('Multiple requests in one test', async function() {
    const r1 = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    assert.strictEqual(r1.status, 200);

    const r2 = await fetch('https://jsonplaceholder.typicode.com/comments?postId=1');
    assert.strictEqual(r2.status, 200);
  });
});
