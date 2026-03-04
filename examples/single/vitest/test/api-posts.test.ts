import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe("Post Validation", () => {
  test("GET all posts - verify 100 posts returned", withQase(async ({ qase }) => {
    await qase.title("Retrieve all posts from JSONPlaceholder API");
    await qase.fields({ layer: 'api', priority: 'high', severity: 'normal' });

    await qase.step("Send GET request to /posts endpoint", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      expect(response.status).toBe(200);

      const posts = await response.json();
      expect(posts).toHaveLength(100);
    });

    await qase.step("Validate post structure", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const posts = await response.json();

      // Verify posts have required fields
      const firstPost = posts[0];
      expect(firstPost).toHaveProperty('userId');
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('body');
    });
  }));

  test("GET posts by user ID - verify filtered results", withQase(async ({ qase }) => {
    await qase.title("Retrieve posts for specific user");
    await qase.fields({ layer: 'api', severity: 'normal' });
    await qase.parameters({ userId: 1, expectedPosts: 10 });

    await qase.step("Send GET request with userId filter", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1');
      expect(response.status).toBe(200);

      const posts = await response.json();
      expect(posts).toHaveLength(10);
    });

    await qase.step("Verify all posts belong to user 1", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1');
      const posts = await response.json();

      // All posts should have userId: 1
      posts.forEach(post => {
        expect(post.userId).toBe(1);
      });
    });

    await qase.step("Validate post content is not empty", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1');
      const posts = await response.json();

      posts.forEach(post => {
        expect(post.title).toBeTruthy();
        expect(post.body).toBeTruthy();
        expect(post.title.length).toBeGreaterThan(0);
        expect(post.body.length).toBeGreaterThan(0);
      });
    });
  }));

  test("GET post with comments - verify comment structure", withQase(async ({ qase }) => {
    await qase.title("Retrieve post comments and validate structure");
    await qase.fields({ layer: 'api', severity: 'normal' });
    await qase.parameters({ postId: 1 });

    let comments: any[] = [];

    await qase.step("Fetch comments for post 1", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1/comments');
      expect(response.status).toBe(200);

      comments = await response.json();
      expect(comments.length).toBeGreaterThan(0);
    });

    await qase.step("Validate comment structure", async () => {
      const firstComment = comments[0];
      expect(firstComment).toHaveProperty('postId');
      expect(firstComment).toHaveProperty('id');
      expect(firstComment).toHaveProperty('name');
      expect(firstComment).toHaveProperty('email');
      expect(firstComment).toHaveProperty('body');

      // Verify email format
      expect(firstComment.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    await qase.step("Attach first comment for reference", async () => {
      await qase.attach({
        name: 'first-comment.json',
        content: JSON.stringify(comments[0], null, 2),
        type: 'application/json'
      });
    });
  }));
});
