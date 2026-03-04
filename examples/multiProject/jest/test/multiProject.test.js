const { qase } = require('jest-qase-reporter/jest');
const { expect } = require('@jest/globals');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

describe('Multi-project API - User Operations', () => {
  // Report to PROJ1 (case 1) and PROJ2 (case 2)
  test(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'GET all users returns 10 users'), async () => {
    qase.fields({ layer: 'api', severity: 'normal', priority: 'high' });

    await qase.step('Send GET request to /users endpoint', async () => {
      const response = await fetch(`${BASE_URL}/users`);
      expect(response.status).toBe(200);

      const users = await response.json();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(10);
    });

    await qase.step('Verify response contains valid user structure', async () => {
      const response = await fetch(`${BASE_URL}/users`);
      const users = await response.json();
      const firstUser = users[0];

      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('name');
      expect(firstUser).toHaveProperty('email');
    });

    qase.comment('All users returned successfully — reported to PROJ1 and PROJ2');
  });

  // Report to PROJ1 (case 3) and PROJ2 (case 4)
  test(qase.projects({ PROJ1: [3], PROJ2: [4] }, 'GET single user by ID returns correct user'), async () => {
    qase.parameters({ userId: 1 });
    qase.fields({ layer: 'api', severity: 'normal' });

    await qase.step('Send GET request to /users/1', async () => {
      const response = await fetch(`${BASE_URL}/users/1`);
      expect(response.status).toBe(200);

      const user = await response.json();
      expect(user.id).toBe(1);
      expect(user.name).toBe('Leanne Graham');
      expect(user.email).toBe('Sincere@april.biz');
    });

    qase.comment('User details verified — tracked across both projects');
  });

  // Report to PROJ1 (case 5) and PROJ2 (case 6)
  test(qase.projects({ PROJ1: [5], PROJ2: [6] }, 'POST create new user returns 201 with ID'), async () => {
    qase.fields({ layer: 'api', severity: 'critical', priority: 'high' });

    const newUser = {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
    };

    await qase.step('Send POST request to create user', async () => {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(201);

      const createdUser = await response.json();
      expect(createdUser).toHaveProperty('id');

      qase.attach({
        name: 'request-body.json',
        content: JSON.stringify(newUser, null, 2),
        contentType: 'application/json',
      });
    });

    qase.comment('User created — reported to PROJ1 and PROJ2');
  });

  // Report to PROJ1 (case 7) and PROJ2 (case 8)
  test(qase.projects({ PROJ1: [7], PROJ2: [8] }, 'DELETE user returns 200 status'), async () => {
    qase.fields({ layer: 'api', severity: 'normal' });
    qase.comment('Note: JSONPlaceholder fakes DELETE — no actual deletion occurs');

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
  });
});
