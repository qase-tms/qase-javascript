import { describe, test, expect } from 'vitest';
import { addQaseProjects, withQase } from 'vitest-qase-reporter/vitest';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

describe('Multi-project API - User Operations', () => {
  // Report to PROJ1 (case 1) and PROJ2 (case 2)
  test(
    addQaseProjects('GET all users returns 10 users', { PROJ1: [1], PROJ2: [2] }),
    withQase(async ({ qase }) => {
      await qase.fields({ layer: 'api', severity: 'normal', priority: 'high' });

      await qase.step('Send GET request to /users endpoint', async () => {
        const response = await fetch(`${BASE_URL}/users`);
        expect(response.status).toBe(200);

        const users = await response.json();
        expect(users).toHaveLength(10);
      });

      await qase.step('Verify user data structure', async () => {
        const response = await fetch(`${BASE_URL}/users`);
        const users = await response.json();

        expect(users[0]).toHaveProperty('id');
        expect(users[0]).toHaveProperty('name');
        expect(users[0]).toHaveProperty('email');
      });

      await qase.comment('All users returned — reported to PROJ1 and PROJ2');
    }),
  );

  // Report to PROJ1 (case 3) and PROJ2 (case 4)
  test(
    addQaseProjects('GET single user by ID returns correct user', { PROJ1: [3], PROJ2: [4] }),
    withQase(async ({ qase }) => {
      await qase.fields({ layer: 'api', severity: 'normal' });
      await qase.parameters({ userId: 1 });

      await qase.step('Send GET request to /users/1', async () => {
        const response = await fetch(`${BASE_URL}/users/1`);
        expect(response.status).toBe(200);

        const user = await response.json();
        expect(user.id).toBe(1);
        expect(user.name).toBe('Leanne Graham');
        expect(user.email).toBe('Sincere@april.biz');
      });

      await qase.step('Verify user has address and company', async () => {
        const response = await fetch(`${BASE_URL}/users/1`);
        const user = await response.json();

        expect(user.address).toHaveProperty('city');
        expect(user.company).toHaveProperty('name');
      });

      await qase.comment('User details verified — tracked across both projects');
    }),
  );

  // Report to PROJ1 (case 5) and PROJ2 (case 6)
  test(
    addQaseProjects('POST create new user returns 201 with ID', { PROJ1: [5], PROJ2: [6] }),
    withQase(async ({ qase }) => {
      await qase.fields({ layer: 'api', severity: 'critical', priority: 'high' });

      const newUser = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
      };

      await qase.step('Send POST request with new user data', async () => {
        const response = await fetch(`${BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });

        expect(response.status).toBe(201);

        const createdUser = await response.json();
        expect(createdUser).toHaveProperty('id');
      });

      await qase.step('Attach request payload', async () => {
        await qase.attach({
          name: 'request-body.json',
          content: JSON.stringify(newUser, null, 2),
          type: 'application/json',
        });
      });

      await qase.comment('User created — reported to PROJ1 and PROJ2');
    }),
  );

  // Report to PROJ1 (case 7) and PROJ2 (case 8)
  test(
    addQaseProjects('DELETE user returns 200 status', { PROJ1: [7], PROJ2: [8] }),
    withQase(async ({ qase }) => {
      await qase.fields({ layer: 'api', severity: 'normal' });
      await qase.comment('Note: JSONPlaceholder fakes DELETE — no actual deletion occurs');

      await qase.step('Send DELETE request to /users/1', async () => {
        const response = await fetch(`${BASE_URL}/users/1`, {
          method: 'DELETE',
        });
        expect(response.status).toBe(200);
      });

      await qase.step('Verify response is empty object', async () => {
        const response = await fetch(`${BASE_URL}/users/1`, {
          method: 'DELETE',
        });
        const result = await response.json();
        expect(result).toEqual({});
      });
    }),
  );
});
