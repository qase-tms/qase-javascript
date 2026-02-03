const { Given, When, Then } = require('@cucumber/cucumber');

Given('I have a step', function() {
  console.log('I have a step');
  this.attach('I\'m an attachment', 'text/plain');
});

Given('I have another step', function() {
  console.log('I have another step');
});

When('I do something', function() {
  console.log('I do something');
});

Then('I expect something to happen', function() {
  console.log('I expect something to happen');
});

Then('I fail', function() {
  throw new Error('I fail');
});

When('I fail', function() {
  throw new Error('I fail');
});
