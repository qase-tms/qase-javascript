const { qase } = require('jest-qase-reporter/jest');
const { expect } = require('@jest/globals');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

describe('JSONPlaceholder API - User CRUD Operations', () => {
  test(qase(1, 'GET all users returns 10 users'), async () => {
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
      expect(firstUser).toHaveProperty('address');
    });
  });

  test(qase(2, 'GET single user by ID returns correct user'), async () => {
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

    await qase.step('Verify user address and company information', async () => {
      const response = await fetch(`${BASE_URL}/users/1`);
      const user = await response.json();

      expect(user.address).toHaveProperty('city');
      expect(user.address.city).toBe('Gwenborough');
      expect(user.company).toHaveProperty('name');
    });
  });

  test(qase(3, 'POST create new user returns 201 with ID'), async () => {
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
      expect(createdUser.id).toBe(11);

      // Attach the request body
      qase.attach({
        name: 'request-body.json',
        content: JSON.stringify(newUser, null, 2),
        contentType: 'application/json',
      });
    });
  });

  test(qase(4, 'DELETE user returns 200 status'), async () => {
    qase.fields({ layer: 'api', severity: 'normal' });
    qase.comment('Note: JSONPlaceholder fakes DELETE operations - no actual deletion occurs');

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
