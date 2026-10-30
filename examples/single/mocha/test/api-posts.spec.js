const { qase } = require('mocha-qase-reporter/mocha');
const assert = require('assert');

describe('JSONPlaceholder Post Validation', function() {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  it(qase(5, 'GET all posts - verify 100 posts returned'), async function() {
    this.fields({ priority: 'high' });

    const response = await fetch(`${BASE_URL}/posts`);

    this.step('Verify response status is 200', () => {
      assert.strictEqual(response.status, 200);
    });

    const posts = await response.json();

    this.step('Verify 100 posts are returned', () => {
      assert.strictEqual(Array.isArray(posts), true, 'Response should be an array');
      assert.strictEqual(posts.length, 100, 'Should have exactly 100 posts');
    });

    this.step('Verify post structure', () => {
      const firstPost = posts[0];
      assert.ok(firstPost.id, 'Post should have id');
      assert.ok(firstPost.userId, 'Post should have userId');
      assert.ok(firstPost.title, 'Post should have title');
      assert.ok(firstPost.body, 'Post should have body');
    });
  });

  it(qase(6, 'GET posts by user ID - verify filtered results'), async function() {
    const testUserId = 1;
    this.parameters({ userId: String(testUserId) });

    const response = await fetch(`${BASE_URL}/posts?userId=${testUserId}`);

    this.step('Verify response status is 200', () => {
      assert.strictEqual(response.status, 200);
    });

    const posts = await response.json();

    this.step('Verify all posts belong to the specified user', () => {
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

    this.step('Verify post count for user 1 is 10', () => {
      assert.strictEqual(posts.length, 10, 'User 1 should have exactly 10 posts');
    });
  });

  it(qase(7, 'GET post with comments - verify comment structure'), async function() {
    const testPostId = 1;

    const postResponse = await fetch(`${BASE_URL}/posts/${testPostId}`);
    const post = await postResponse.json();

    this.step('Verify post was retrieved successfully', () => {
      assert.strictEqual(postResponse.status, 200);
      assert.strictEqual(post.id, testPostId);
      assert.ok(post.title, 'Post should have a title');
    });

    const commentsResponse = await fetch(`${BASE_URL}/posts/${testPostId}/comments`);

    this.step('Verify comments response status is 200', () => {
      assert.strictEqual(commentsResponse.status, 200);
    });

    const comments = await commentsResponse.json();

    this.step('Verify comment count and structure', () => {
      assert.strictEqual(Array.isArray(comments), true, 'Comments should be an array');
      assert.ok(comments.length > 0, 'Post should have comments');

      const firstComment = comments[0];
      assert.strictEqual(firstComment.postId, testPostId, 'Comment should belong to the post');
      assert.ok(firstComment.id, 'Comment should have id');
      assert.ok(firstComment.name, 'Comment should have name');
      assert.ok(firstComment.email, 'Comment should have email');
      assert.ok(firstComment.body, 'Comment should have body');
    });

    this.attach({
      name: 'post-with-comments.json',
      content: JSON.stringify({ post, comments }, null, 2),
      contentType: 'application/json'
    });
  });
});
