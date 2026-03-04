const { qase } = require('jest-qase-reporter/jest');
const { expect } = require('@jest/globals');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

describe('JSONPlaceholder API - Post Validation', () => {
  test(qase(5, 'GET all posts returns 100 posts'), async () => {
    qase.fields({ layer: 'api', severity: 'normal', priority: 'high' });

    await qase.step('Send GET request to /posts endpoint', async () => {
      const response = await fetch(`${BASE_URL}/posts`);
      expect(response.status).toBe(200);

      const posts = await response.json();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(100);
    });

    await qase.step('Verify post structure', async () => {
      const response = await fetch(`${BASE_URL}/posts`);
      const posts = await response.json();
      const firstPost = posts[0];

      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('userId');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('body');
    });
  });

  test(qase(6, 'GET posts filtered by user ID returns correct results'), async () => {
    qase.parameters({ userId: 1, filterType: 'query_parameter' });
    qase.fields({ layer: 'api', severity: 'normal' });

    await qase.step('Send GET request with userId filter', async () => {
      const response = await fetch(`${BASE_URL}/posts?userId=1`);
      expect(response.status).toBe(200);

      const posts = await response.json();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(10);
    });

    await qase.step('Verify all posts belong to user 1', async () => {
      const response = await fetch(`${BASE_URL}/posts?userId=1`);
      const posts = await response.json();

      posts.forEach((post) => {
        expect(post.userId).toBe(1);
      });
    });
  });

  test(qase(7, 'GET post with comments returns nested data'), async () => {
    qase.fields({ layer: 'api', severity: 'normal', priority: 'medium' });

    let postData;

    await qase.step('Fetch post by ID', async () => {
      const response = await fetch(`${BASE_URL}/posts/1`);
      expect(response.status).toBe(200);

      postData = await response.json();
      expect(postData.id).toBe(1);
      expect(postData.title).toBeTruthy();
    });

    await qase.step('Fetch comments for the post', async () => {
      const response = await fetch(`${BASE_URL}/posts/1/comments`);
      expect(response.status).toBe(200);

      const comments = await response.json();
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(5);

      // Attach the full response with post and comments
      qase.attach({
        name: 'post-with-comments.json',
        content: JSON.stringify({ post: postData, comments }, null, 2),
        contentType: 'application/json',
      });
    });

    await qase.step('Verify comment structure', async () => {
      const response = await fetch(`${BASE_URL}/posts/1/comments`);
      const comments = await response.json();
      const firstComment = comments[0];

      expect(firstComment).toHaveProperty('postId');
      expect(firstComment).toHaveProperty('id');
      expect(firstComment).toHaveProperty('name');
      expect(firstComment).toHaveProperty('email');
      expect(firstComment).toHaveProperty('body');
      expect(firstComment.postId).toBe(1);
    });
  });
});
