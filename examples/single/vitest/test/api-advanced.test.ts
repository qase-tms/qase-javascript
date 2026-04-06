import { describe, test, expect } from 'vitest';
import { withQase, addQaseId } from 'vitest-qase-reporter/vitest';

describe("Advanced Qase Features", () => {
  test(addQaseId("Complex nested steps - multi-step user and post retrieval", [11]), withQase(async ({ qase }) => {
    await qase.title("Demonstrate nested step execution");
    await qase.fields({ layer: 'api', severity: 'normal', priority: 'medium' });

    let userId: number;
    let userName: string;
    let userPosts: any[];

    await qase.step("Step 1: Retrieve user data", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
      const user = await response.json();

      userId = user.id;
      userName = user.name;

      await qase.step("Nested: Validate user data completeness", async () => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
      });
    });

    await qase.step("Step 2: Retrieve posts for user", async () => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
      userPosts = await response.json();

      await qase.step("Nested: Validate posts belong to user", async () => {
        expect(userPosts.length).toBeGreaterThan(0);
        userPosts.forEach(post => {
          expect(post.userId).toBe(userId);
        });
      });
    });

    await qase.step("Step 3: Verify relationship consistency", async () => {
      await qase.parameters({
        userId: String(userId),
        userName: userName,
        postCount: String(userPosts.length)
      });

      expect(userPosts.length).toBe(10); // Each user has 10 posts
    });
  }));

  test(addQaseId("Suite hierarchy - demonstrate nested suite structure", [12]), withQase(async ({ qase }) => {
    await qase.title("Demonstrate suite hierarchy with tab separators");
    await qase.suite('API Tests\tAdvanced\tRelationships');
    await qase.fields({ layer: 'api', severity: 'normal' });

    await qase.step("Fetch user and their albums", async () => {
      const userResponse = await fetch('https://jsonplaceholder.typicode.com/users/1');
      const user = await userResponse.json();

      const albumsResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/albums`);
      const albums = await albumsResponse.json();

      expect(albums.length).toBeGreaterThan(0);
      expect(albums[0].userId).toBe(user.id);
    });

    await qase.step("Verify album structure", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/albums/1');
      const album = await response.json();

      expect(album).toHaveProperty('userId');
      expect(album).toHaveProperty('id');
      expect(album).toHaveProperty('title');
    });
  }));

  test(addQaseId("Parameterized test pattern - demonstrate multiple test parameters", [13]), withQase(async ({ qase }) => {
    await qase.title("Verify multiple users with different parameters");
    await qase.fields({ layer: 'api', severity: 'normal' });

    const userIds = [1, 2, 3];

    for (const userId of userIds) {
      await qase.step(`Test user ${userId}`, async () => {
        await qase.parameters({
          userId: String(userId),
          iteration: String(userIds.indexOf(userId) + 1),
          totalIterations: String(userIds.length)
        });

        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        expect(response.status).toBe(200);

        const user = await response.json();
        expect(user.id).toBe(userId);
        expect(user.name).toBeTruthy();
      });
    }

    await qase.step("Verify all users processed", async () => {
      await qase.comment(`Successfully validated ${userIds.length} users with different parameters`);
    });
  }));

  test.skip(addQaseId("Authentication endpoint placeholder", [14]), () => {
    qase.ignore();
    // This test is intentionally skipped to demonstrate qase.ignore()
    // Future feature: test OAuth authentication flow
    // Note: qase.ignore() is NOT async, unlike other qase methods
  });
});
