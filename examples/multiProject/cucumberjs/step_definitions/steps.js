const { Given } = require('@cucumber/cucumber');

Given('I have a step', function () {
  console.log('I have a step');
  this.attach("I'm an attachment", 'text/plain');
});
