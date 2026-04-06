import { describe, test, expect } from 'vitest';
import { withQase, addQaseId } from 'vitest-qase-reporter/vitest';

describe("User CRUD Operations", () => {
  test(addQaseId("GET all users - verify 10 users returned", [1]), withQase(async ({ qase }) => {
    await qase.title("Retrieve all users from JSONPlaceholder API");
    await qase.fields({ layer: 'api', severity: 'normal' });

    await qase.step("Send GET request to /users endpoint", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      expect(response.status).toBe(200);

      const users = await response.json();
      expect(users).toHaveLength(10);
    });

    await qase.step("Validate user data structure", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();

      // Verify first user has required fields
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('name');
      expect(users[0]).toHaveProperty('email');
      expect(users[0]).toHaveProperty('address');
    });
  }));

  test(addQaseId("GET single user by ID - verify user 1 is Leanne Graham", [2]), withQase(async ({ qase }) => {
    await qase.title("Retrieve specific user by ID");
    await qase.fields({ layer: 'api', severity: 'normal' });
    await qase.parameters({ userId: '1' });

    await qase.step("Send GET request to /users/1", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
      expect(response.status).toBe(200);

      const user = await response.json();
      expect(user.id).toBe(1);
      expect(user.name).toBe('Leanne Graham');
      expect(user.email).toBe('Sincere@april.biz');
    });

    await qase.step("Validate user address structure", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
      const user = await response.json();

      expect(user.address).toHaveProperty('street');
      expect(user.address).toHaveProperty('city');
      expect(user.address).toHaveProperty('zipcode');
      expect(user.address.geo).toHaveProperty('lat');
      expect(user.address.geo).toHaveProperty('lng');
    });
  }));

  test(addQaseId("POST create user - verify 201 response and returned ID", [3]), withQase(async ({ qase }) => {
    await qase.title("Create new user via POST request");
    await qase.fields({ layer: 'api', severity: 'critical', priority: 'high' });

    const newUser = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com'
    };

    await qase.step("Send POST request with new user data", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });

      expect(response.status).toBe(201);

      const createdUser = await response.json();
      expect(createdUser).toHaveProperty('id');
      expect(createdUser.id).toBeGreaterThan(0);
    });

    await qase.step("Attach request body for debugging", async () => {
      await qase.attach({
        name: 'new-user-payload.json',
        content: JSON.stringify(newUser, null, 2),
        type: 'application/json'
      });
    });
  }));

  test(addQaseId("DELETE user - verify 200 response", [4]), withQase(async ({ qase }) => {
    await qase.title("Delete user by ID");
    await qase.fields({ layer: 'api', severity: 'normal' });
    await qase.parameters({ userId: '1' });
    await qase.comment("Note: JSONPlaceholder fakes DELETE requests - no actual data is removed");

    await qase.step("Send DELETE request to /users/1", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/1', {
        method: 'DELETE'
      });

      expect(response.status).toBe(200);
    });

    await qase.step("Verify delete operation succeeded", async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/1', {
        method: 'DELETE'
      });

      // JSONPlaceholder returns empty object on successful delete
      const result = await response.json();
      expect(result).toEqual({});
    });
  }));
});
