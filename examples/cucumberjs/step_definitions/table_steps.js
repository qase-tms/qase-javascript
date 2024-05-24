const { Given, Then } = require('@cucumber/cucumber');

Given('I have a table with {int} rows', function(rows) {
  console.log(`Table with ${rows} rows`);
});

Then('the table should have {int} rows', function(rows) {
  console.log(`Table with ${rows} rows`);
  this.attach('image/png;base64', 'image/png;base64', 'image/png;base64');
});
