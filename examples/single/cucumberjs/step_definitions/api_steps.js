const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

Given('the API is available at {string}', function(baseUrl) {
  this.baseUrl = baseUrl;
});

When('I send a GET request to {string}', async function(endpoint) {
  const url = `${this.baseUrl}${endpoint}`;
  this.response = await fetch(url);
  this.responseData = await this.response.json();

  // Attach response data as JSON (demonstrates this.attach())
  this.attach(JSON.stringify({
    url: url,
    status: this.response.status,
    body: Array.isArray(this.responseData)
      ? `[${this.responseData.length} items]`
      : this.responseData,
  }, null, 2), 'application/json');
});

When('I send a POST request to {string} with body:', async function(endpoint, docString) {
  const url = `${this.baseUrl}${endpoint}`;
  this.response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: docString,
  });
  this.responseData = await this.response.json();

  // Attach request and response
  this.attach(JSON.stringify({
    request: { url, method: 'POST', body: JSON.parse(docString) },
    response: { status: this.response.status, body: this.responseData },
  }, null, 2), 'application/json');
});

When('I send a DELETE request to {string}', async function(endpoint) {
  const url = `${this.baseUrl}${endpoint}`;
  this.response = await fetch(url, { method: 'DELETE' });
  this.responseData = await this.response.json();

  // Attach response
  this.attach(JSON.stringify({
    url: url,
    method: 'DELETE',
    status: this.response.status,
  }, null, 2), 'application/json');
});

Then('the response status should be {int}', function(expectedStatus) {
  assert.strictEqual(this.response.status, expectedStatus,
    `Expected status ${expectedStatus} but got ${this.response.status}`);
});

Then('the response should contain {int} items', function(count) {
  assert.ok(Array.isArray(this.responseData),
    `Expected response to be an array but got ${typeof this.responseData}`);
  assert.strictEqual(this.responseData.length, count,
    `Expected ${count} items but got ${this.responseData.length}`);
});

Then('each item should have an {string} field', function(fieldName) {
  assert.ok(Array.isArray(this.responseData), 'Response should be an array');
  for (const item of this.responseData) {
    assert.ok(item[fieldName] !== undefined,
      `Item missing required field: ${fieldName}`);
  }
});

Then('the response {string} should be {string}', function(field, expected) {
  assert.strictEqual(String(this.responseData[field]), expected,
    `Expected ${field} to be "${expected}" but got "${this.responseData[field]}"`);
});

Then('the response should have an {string} field', function(fieldName) {
  assert.ok(this.responseData[fieldName] !== undefined,
    `Response missing required field: ${fieldName}`);
});

Then('the response should have a {string} field', function(fieldName) {
  assert.ok(this.responseData[fieldName] !== undefined,
    `Response missing required field: ${fieldName}`);
});

Then('the response should be an empty object', function() {
  assert.ok(typeof this.responseData === 'object' && !Array.isArray(this.responseData),
    'Response should be an object');
  assert.strictEqual(Object.keys(this.responseData).length, 0,
    `Expected empty object but got ${JSON.stringify(this.responseData)}`);
});

Then('all items should have {string} equal to {int}', function(field, expected) {
  assert.ok(Array.isArray(this.responseData), 'Response should be an array');
  for (const item of this.responseData) {
    assert.strictEqual(item[field], expected,
      `Expected ${field} to be ${expected} but got ${item[field]}`);
  }
});
