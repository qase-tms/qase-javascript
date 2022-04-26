const {Then} = require('@cucumber/cucumber');
const {When} = require('@cucumber/cucumber');
const {Given} = require('@cucumber/cucumber');
const fs = require('fs');

Given(/^I am on the cucumber\.js GitHub repository$/, function(callback) {
    // The callback argument will execute the next step
    // This is passed to zombie.visit, which will execute it once the page has loaded
    this.browser.visit('https://github.com/cucumber/cucumber-js', callback);
});

When(/^I go to the README file$/, function() {
    const b = fs.readFileSync(__dirname + '/../logo.svg');
    this.attach(b, 'image/svg+xml');
    // If your code returns a promise then there is no need for the callback
    // This works because zombie.visit returns a promise
    return this.browser.visit('https://github.com/cucumber/cucumber-js/blob/master/README.md');
});

Then(/^I should see a "(.*)" section$/, function(title) {
    this.attach('{"name": "some JSON"}', 'application/json');
    // Using zombie.assert to test a link is present
    // If the assertion fails an error will be thrown and the cucumber test will fail
    // Zombie will use my message in the second argument as the error message
    this.browser.assert.element('a[href="#' + title.toLowerCase() + '"]', 'The "' + title + '" section was not found');
});

Then(/I should see a "(.*)" badge/, function(badge) {
    // You can also use simple strings to match step definitions, cucumber expands this step to regexp:
    // /^I should see a "([^"]*)" badge$/
    this.browser.assert.element('img[alt="' + badge + '"]', 'The "' + badge + '" was not found');
});

Then(/I should see nothing/, () => 'skipped');
