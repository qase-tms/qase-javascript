const { qase } = require('jest-qase-reporter/jest');
const { expect } = require('@jest/globals');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

describe('JSONPlaceholder API - Advanced Features', () => {
  test(qase(12, 'Complex nested steps - fetch user and their posts'), async () => {
    qase.fields({ layer: 'api', severity: 'normal', priority: 'medium' });
    qase.suite('API Tests\tAdvanced\tRelationships');

    let userId;
    let userName;

    await qase.step('Fetch user details', async () => {
      const response = await fetch(`${BASE_URL}/users/1`);
      expect(response.status).toBe(200);

      const user = await response.json();
      userId = user.id;
      userName = user.name;
      expect(userName).toBe('Leanne Graham');

      await qase.step('Validate user has company information', async () => {
        expect(user.company).toHaveProperty('name');
        expect(user.company.name).toBeTruthy();
      });
    });

    await qase.step('Fetch all posts by user', async () => {
      const response = await fetch(`${BASE_URL}/posts?userId=${userId}`);
      expect(response.status).toBe(200);

      const posts = await response.json();
      expect(posts.length).toBe(10);

      await qase.step('Verify first post belongs to user', async () => {
        expect(posts[0].userId).toBe(userId);
      });

      await qase.step('Verify post titles are non-empty', async () => {
        posts.forEach((post) => {
          expect(post.title).toBeTruthy();
          expect(post.body).toBeTruthy();
        });
      });
    });
  });

  test(qase(13, 'Suite hierarchy demonstration'), async () => {
    qase.suite('API Tests\tAdvanced\tData Validation');
    qase.fields({ layer: 'api', severity: 'normal' });

    await qase.step('Validate todos endpoint structure', async () => {
      const response = await fetch(`${BASE_URL}/todos/1`);
      expect(response.status).toBe(200);

      const todo = await response.json();
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('userId');
      expect(todo).toHaveProperty('title');
      expect(todo).toHaveProperty('completed');
      expect(typeof todo.completed).toBe('boolean');
    });
  });

  test(qase(14, 'Parameterized test pattern - multiple user IDs'), async () => {
    qase.parameters({
      testScope: 'multiple_users',
      userIds: '1,2,3',
      validationType: 'existence',
    });
    qase.fields({ layer: 'api', severity: 'normal' });

    const userIds = [1, 2, 3];

    for (const userId of userIds) {
      await qase.step(`Verify user ${userId} exists`, async () => {
        const response = await fetch(`${BASE_URL}/users/${userId}`);
        expect(response.status).toBe(200);

        const user = await response.json();
        expect(user.id).toBe(userId);
        expect(user.name).toBeTruthy();
      });
    }
  });

  test(qase(15, 'Albums endpoint with nested photos'), async () => {
    qase.fields({ layer: 'api', severity: 'low', priority: 'low' });

    let albumId;

    await qase.step('Fetch album details', async () => {
      const response = await fetch(`${BASE_URL}/albums/1`);
      expect(response.status).toBe(200);

      const album = await response.json();
      albumId = album.id;
      expect(albumId).toBe(1);
      expect(album.userId).toBe(1);
    });

    await qase.step('Fetch photos in album', async () => {
      const response = await fetch(`${BASE_URL}/albums/${albumId}/photos`);
      expect(response.status).toBe(200);

      const photos = await response.json();
      expect(Array.isArray(photos)).toBe(true);
      expect(photos.length).toBe(50);

      await qase.step('Verify photo structure', async () => {
        const firstPhoto = photos[0];
        expect(firstPhoto).toHaveProperty('albumId');
        expect(firstPhoto).toHaveProperty('id');
        expect(firstPhoto).toHaveProperty('title');
        expect(firstPhoto).toHaveProperty('url');
        expect(firstPhoto).toHaveProperty('thumbnailUrl');
      });
    });
  });

  test.skip(qase(16, 'Authentication feature (not yet implemented)'), async () => {
    qase.ignore();
    qase.comment('This test will be implemented when JSONPlaceholder adds authentication support');
    qase.fields({ layer: 'api', severity: 'high', priority: 'high' });

    // Placeholder for future authentication tests
    expect(true).toBe(true);
  });
});
