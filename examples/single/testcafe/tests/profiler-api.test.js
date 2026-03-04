fixture`Network Profiler API Tests`
  .page`about:blank`;

test('GET request captured by profiler', async t => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
  await t.expect(response.status).eql(200);
  const user = await response.json();
  await t.expect(user.id).eql(1);
});

test('POST request captured by profiler', async t => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'test', body: 'test body', userId: 1 }),
  });
  await t.expect(response.status).eql(201);
});

test('Multiple requests in one test', async t => {
  const r1 = await fetch('https://jsonplaceholder.typicode.com/posts/1');
  await t.expect(r1.status).eql(200);
  const r2 = await fetch('https://jsonplaceholder.typicode.com/comments?postId=1');
  await t.expect(r2.status).eql(200);
});
