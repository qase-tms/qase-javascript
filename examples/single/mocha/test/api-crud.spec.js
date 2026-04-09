const { qase } = require('mocha-qase-reporter/mocha');
const assert = require('assert');

describe('JSONPlaceholder User CRUD Operations', function() {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  it(qase(1, 'GET all users - verify 10 users returned'), async function() {
    qase.fields({ layer: 'api', severity: 'normal' });

    let response;
    let users;

    await qase.step('Send GET request to /users endpoint', async () => {
      response = await fetch(`${BASE_URL}/users`);
    });

    await qase.step('Verify response status is 200', async () => {
      assert.strictEqual(response.status, 200, 'Expected status code 200');
    });

    await qase.step('Parse JSON response', async () => {
      users = await response.json();
    });

    await qase.step('Verify 10 users are returned', async () => {
      assert.strictEqual(Array.isArray(users), true, 'Response should be an array');
      assert.strictEqual(users.length, 10, 'Should have exactly 10 users');
    });

    await qase.step('Verify user structure has required fields', async () => {
      const firstUser = users[0];
      assert.ok(firstUser.id, 'User should have id');
      assert.ok(firstUser.name, 'User should have name');
      assert.ok(firstUser.email, 'User should have email');
      assert.ok(firstUser.username, 'User should have username');
    });
  });

  it(qase(2, 'GET single user by ID - verify user details'), async function() {
    qase.parameters({ userId: 1 });

    let response;
    let user;

    await qase.step('Send GET request to /users/1', async () => {
      response = await fetch(`${BASE_URL}/users/1`);
    });

    await qase.step('Verify response status is 200', async () => {
      assert.strictEqual(response.status, 200);
    });

    await qase.step('Parse user data', async () => {
      user = await response.json();
    });

    await qase.step('Verify user is Leanne Graham', async () => {
      assert.strictEqual(user.id, 1, 'User ID should be 1');
      assert.strictEqual(user.name, 'Leanne Graham', 'User name should be Leanne Graham');
      assert.strictEqual(user.email, 'Sincere@april.biz', 'Email should match expected value');
      assert.strictEqual(user.username, 'Bret', 'Username should be Bret');
    });

    await qase.step('Verify user has address and company details', async () => {
      assert.ok(user.address, 'User should have address');
      assert.ok(user.company, 'User should have company');
      assert.ok(user.address.city, 'Address should have city');
      assert.ok(user.company.name, 'Company should have name');
    });
  });

  it(qase(3, 'POST create user - verify 201 response and returned ID'), async function() {

    const newUser = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      website: 'johndoe.com'
    };

    qase.attach({
      name: 'new-user-request.json',
      content: JSON.stringify(newUser, null, 2),
      contentType: 'application/json'
    });

    let response;
    let createdUser;

    await qase.step('Send POST request to create user', async () => {
      response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    });

    await qase.step('Verify response status is 201 (Created)', async () => {
      assert.strictEqual(response.status, 201, 'Expected status code 201 for created resource');
    });

    await qase.step('Parse created user data', async () => {
      createdUser = await response.json();
    });

    await qase.step('Verify returned user has ID and matches request data', async () => {
      assert.ok(createdUser.id, 'Created user should have an ID');
      assert.strictEqual(createdUser.name, newUser.name, 'Name should match');
      assert.strictEqual(createdUser.email, newUser.email, 'Email should match');
      assert.strictEqual(createdUser.username, newUser.username, 'Username should match');
    });

    qase.attach({
      name: 'created-user-response.json',
      content: JSON.stringify(createdUser, null, 2),
      contentType: 'application/json'
    });
  });

  it(qase(4, 'DELETE user - verify 200 response'), async function() {
    qase.comment('Note: JSONPlaceholder fakes DELETE operations - data is not actually deleted');

    let response;

    await qase.step('Send DELETE request for user ID 1', async () => {
      response = await fetch(`${BASE_URL}/users/1`, {
        method: 'DELETE'
      });
    });

    await qase.step('Verify response status is 200', async () => {
      assert.strictEqual(response.status, 200, 'DELETE should return 200 status');
    });

    await qase.step('Verify empty response body', async () => {
      const body = await response.json();
      // JSONPlaceholder returns empty object {} for successful DELETE
      assert.strictEqual(typeof body, 'object', 'Response should be an object');
    });
  });
});
