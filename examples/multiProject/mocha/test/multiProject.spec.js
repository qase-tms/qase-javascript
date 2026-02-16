const assert = require('assert');
const { qase } = require('mocha-qase-reporter/mocha');

describe('Multi-project API - User Operations', function () {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  // Report to PROJ1 (case 1) and PROJ2 (case 2)
  it(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'GET all users returns 10 users'), async function () {
    qase.fields({ layer: 'api', severity: 'normal', priority: 'high' });

    let response;
    let users;

    await qase.step('Send GET request to /users endpoint', async () => {
      response = await fetch(`${BASE_URL}/users`);
    });

    await qase.step('Verify response status is 200', async () => {
      assert.strictEqual(response.status, 200, 'Expected status code 200');
    });

    await qase.step('Parse and verify user list', async () => {
      users = await response.json();
      assert.strictEqual(Array.isArray(users), true, 'Response should be an array');
      assert.strictEqual(users.length, 10, 'Should have exactly 10 users');
    });

    await qase.step('Verify user structure has required fields', async () => {
      const firstUser = users[0];
      assert.ok(firstUser.id, 'User should have id');
      assert.ok(firstUser.name, 'User should have name');
      assert.ok(firstUser.email, 'User should have email');
    });

    qase.comment('All users returned successfully — reported to PROJ1 and PROJ2');
  });

  // Report to PROJ1 (case 3) and PROJ2 (case 4)
  it(qase.projects({ PROJ1: [3], PROJ2: [4] }, 'GET single user by ID returns correct user'), async function () {
    qase.parameters({ userId: 1 });
    qase.fields({ layer: 'api', severity: 'normal' });

    let response;
    let user;

    await qase.step('Send GET request to /users/1', async () => {
      response = await fetch(`${BASE_URL}/users/1`);
    });

    await qase.step('Verify response status is 200', async () => {
      assert.strictEqual(response.status, 200);
    });

    await qase.step('Verify user is Leanne Graham', async () => {
      user = await response.json();
      assert.strictEqual(user.id, 1, 'User ID should be 1');
      assert.strictEqual(user.name, 'Leanne Graham');
      assert.strictEqual(user.email, 'Sincere@april.biz');
    });

    await qase.step('Verify user has address and company details', async () => {
      assert.ok(user.address, 'User should have address');
      assert.ok(user.company, 'User should have company');
    });

    qase.comment('User details verified — tracked across both projects');
  });

  // Report to PROJ1 (case 5) and PROJ2 (case 6)
  it(qase.projects({ PROJ1: [5], PROJ2: [6] }, 'POST create new user returns 201 with ID'), async function () {
    qase.fields({ layer: 'api', severity: 'critical', priority: 'high' });

    const newUser = {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
    };

    let response;
    let createdUser;

    await qase.step('Send POST request to create user', async () => {
      response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
    });

    await qase.step('Verify response status is 201 (Created)', async () => {
      assert.strictEqual(response.status, 201, 'Expected status code 201 for created resource');
    });

    await qase.step('Verify returned user has ID and matches request data', async () => {
      createdUser = await response.json();
      assert.ok(createdUser.id, 'Created user should have an ID');
      assert.strictEqual(createdUser.name, newUser.name, 'Name should match');
      assert.strictEqual(createdUser.email, newUser.email, 'Email should match');
    });

    qase.attach({
      name: 'request-body.json',
      content: JSON.stringify(newUser, null, 2),
      contentType: 'application/json',
    });

    qase.comment('User created — reported to PROJ1 and PROJ2');
  });

  // Report to PROJ1 (case 7) and PROJ2 (case 8)
  it(qase.projects({ PROJ1: [7], PROJ2: [8] }, 'DELETE user returns 200 status'), async function () {
    qase.fields({ layer: 'api', severity: 'normal' });
    qase.comment('Note: JSONPlaceholder fakes DELETE — no actual deletion occurs');

    let response;

    await qase.step('Send DELETE request for user ID 1', async () => {
      response = await fetch(`${BASE_URL}/users/1`, {
        method: 'DELETE',
      });
    });

    await qase.step('Verify response status is 200', async () => {
      assert.strictEqual(response.status, 200, 'DELETE should return 200 status');
    });

    await qase.step('Verify empty response body', async () => {
      const body = await response.json();
      assert.strictEqual(typeof body, 'object', 'Response should be an object');
    });
  });
});
