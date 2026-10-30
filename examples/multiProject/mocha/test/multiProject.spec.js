const assert = require('assert');
const { qase } = require('mocha-qase-reporter/mocha');

describe('Multi-project API - User Operations', function () {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  // Report to PROJ1 (case 1) and PROJ2 (case 2)
  it(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'GET all users returns 10 users'), async function () {
    this.fields({ layer: 'api', severity: 'normal', priority: 'high' });

    const response = await fetch(`${BASE_URL}/users`);

    this.step('Verify response status is 200', () => {
      assert.strictEqual(response.status, 200, 'Expected status code 200');
    });

    const users = await response.json();

    this.step('Verify user list', () => {
      assert.strictEqual(Array.isArray(users), true, 'Response should be an array');
      assert.strictEqual(users.length, 10, 'Should have exactly 10 users');
    });

    this.step('Verify user structure has required fields', () => {
      const firstUser = users[0];
      assert.ok(firstUser.id, 'User should have id');
      assert.ok(firstUser.name, 'User should have name');
      assert.ok(firstUser.email, 'User should have email');
    });

    this.comment('All users returned successfully — reported to PROJ1 and PROJ2');
  });

  // Report to PROJ1 (case 3) and PROJ2 (case 4)
  it(qase.projects({ PROJ1: [3], PROJ2: [4] }, 'GET single user by ID returns correct user'), async function () {
    this.parameters({ userId: '1' });
    this.fields({ layer: 'api', severity: 'normal' });

    const response = await fetch(`${BASE_URL}/users/1`);

    this.step('Verify response status is 200', () => {
      assert.strictEqual(response.status, 200);
    });

    const user = await response.json();

    this.step('Verify user is Leanne Graham', () => {
      assert.strictEqual(user.id, 1, 'User ID should be 1');
      assert.strictEqual(user.name, 'Leanne Graham');
      assert.strictEqual(user.email, 'Sincere@april.biz');
    });

    this.step('Verify user has address and company details', () => {
      assert.ok(user.address, 'User should have address');
      assert.ok(user.company, 'User should have company');
    });

    this.comment('User details verified — tracked across both projects');
  });

  // Report to PROJ1 (case 5) and PROJ2 (case 6)
  it(qase.projects({ PROJ1: [5], PROJ2: [6] }, 'POST create new user returns 201 with ID'), async function () {
    this.fields({ layer: 'api', severity: 'critical', priority: 'high' });

    const newUser = {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
    };

    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    this.step('Verify response status is 201 (Created)', () => {
      assert.strictEqual(response.status, 201, 'Expected status code 201 for created resource');
    });

    const createdUser = await response.json();

    this.step('Verify returned user has ID and matches request data', () => {
      assert.ok(createdUser.id, 'Created user should have an ID');
      assert.strictEqual(createdUser.name, newUser.name, 'Name should match');
      assert.strictEqual(createdUser.email, newUser.email, 'Email should match');
    });

    this.attach({
      name: 'request-body.json',
      content: JSON.stringify(newUser, null, 2),
      contentType: 'application/json',
    });

    this.comment('User created — reported to PROJ1 and PROJ2');
  });

  // Report to PROJ1 (case 7) and PROJ2 (case 8)
  it(qase.projects({ PROJ1: [7], PROJ2: [8] }, 'DELETE user returns 200 status'), async function () {
    this.fields({ layer: 'api', severity: 'normal' });
    this.comment('Note: JSONPlaceholder fakes DELETE — no actual deletion occurs');

    const response = await fetch(`${BASE_URL}/users/1`, {
      method: 'DELETE',
    });

    this.step('Verify response status is 200', () => {
      assert.strictEqual(response.status, 200, 'DELETE should return 200 status');
    });

    const body = await response.json();

    this.step('Verify empty response body', () => {
      assert.strictEqual(typeof body, 'object', 'Response should be an object');
    });
  });
});
