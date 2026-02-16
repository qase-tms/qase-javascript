const { qase } = require('mocha-qase-reporter/mocha');
const assert = require('assert');

describe('JSONPlaceholder Post Validation', function() {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  it(qase(5, 'GET all posts - verify 100 posts returned'), async function() {
    qase.fields({ priority: 'high' });

    let response;
    let posts;

    await qase.step('Send GET request to /posts endpoint', async () => {
      response = await fetch(`${BASE_URL}/posts`);
    });

    await qase.step('Verify response status is 200', async () => {
      assert.strictEqual(response.status, 200);
    });

    await qase.step('Parse posts data', async () => {
      posts = await response.json();
    });

    await qase.step('Verify 100 posts are returned', async () => {
      assert.strictEqual(Array.isArray(posts), true, 'Response should be an array');
      assert.strictEqual(posts.length, 100, 'Should have exactly 100 posts');
    });

    await qase.step('Verify post structure', async () => {
      const firstPost = posts[0];
      assert.ok(firstPost.id, 'Post should have id');
      assert.ok(firstPost.userId, 'Post should have userId');
      assert.ok(firstPost.title, 'Post should have title');
      assert.ok(firstPost.body, 'Post should have body');
    });
  });

  it(qase(6, 'GET posts by user ID - verify filtered results'), async function() {
    const testUserId = 1;
    qase.parameters({ userId: testUserId });

    let response;
    let posts;

    await qase.step(`Send GET request to /posts?userId=${testUserId}`, async () => {
      response = await fetch(`${BASE_URL}/posts?userId=${testUserId}`);
    });

    await qase.step('Verify response status is 200', async () => {
      assert.strictEqual(response.status, 200);
    });

    await qase.step('Parse filtered posts', async () => {
      posts = await response.json();
    });

    await qase.step('Verify all posts belong to the specified user', async () => {
      assert.strictEqual(Array.isArray(posts), true, 'Response should be an array');
      assert.ok(posts.length > 0, 'Should have at least one post');

      posts.forEach((post, index) => {
        assert.strictEqual(
          post.userId,
          testUserId,
          `Post ${index} should belong to user ${testUserId}`
        );
      });
    });

    await qase.step('Verify post count for user 1 is 10', async () => {
      assert.strictEqual(posts.length, 10, 'User 1 should have exactly 10 posts');
    });
  });

  it(qase(7, 'GET post with comments - verify comment structure'), async function() {
    const testPostId = 1;

    let postResponse;
    let post;
    let commentsResponse;
    let comments;

    await qase.step(`Send GET request to /posts/${testPostId}`, async () => {
      postResponse = await fetch(`${BASE_URL}/posts/${testPostId}`);
      post = await postResponse.json();
    });

    await qase.step('Verify post was retrieved successfully', async () => {
      assert.strictEqual(postResponse.status, 200);
      assert.strictEqual(post.id, testPostId);
      assert.ok(post.title, 'Post should have a title');
    });

    await qase.step(`Send GET request to /posts/${testPostId}/comments`, async () => {
      commentsResponse = await fetch(`${BASE_URL}/posts/${testPostId}/comments`);
    });

    await qase.step('Verify comments response status is 200', async () => {
      assert.strictEqual(commentsResponse.status, 200);
    });

    await qase.step('Parse comments data', async () => {
      comments = await commentsResponse.json();
    });

    await qase.step('Verify comment count and structure', async () => {
      assert.strictEqual(Array.isArray(comments), true, 'Comments should be an array');
      assert.ok(comments.length > 0, 'Post should have comments');

      const firstComment = comments[0];
      assert.strictEqual(firstComment.postId, testPostId, 'Comment should belong to the post');
      assert.ok(firstComment.id, 'Comment should have id');
      assert.ok(firstComment.name, 'Comment should have name');
      assert.ok(firstComment.email, 'Comment should have email');
      assert.ok(firstComment.body, 'Comment should have body');
    });

    qase.attach({
      name: 'post-with-comments.json',
      content: JSON.stringify({ post, comments }, null, 2),
      contentType: 'application/json'
    });
  });
});
