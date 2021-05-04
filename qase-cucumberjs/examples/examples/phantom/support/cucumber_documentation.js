var currentPage;

module.exports = function() {

    this.Given(/^I am on the cucumber\.js GitHub repository$/, function() {
        return this.browser.visit('https://github.com/cucumber/cucumber-js');
    });

    this.When(/^I go to the README file$/, function() {
        return this.browser.visit('https://github.com/cucumber/cucumber-js/blob/master/README.md');
    });

    this.Then(/^I should see a "(.*)" section$/, function(title) {
        // Element checking is async, so we return a promise
        return this.browser.assert.element('a[href="#' + title.toLowerCase() + '"]', 'The "' + title + '" section was not found');
    });

    this.Then('I should see a "$badge" badge', function(badge) {
        return this.browser.assert.element('img[alt="' + badge + '"]', 'The "' + badge + '" was not found');
    });

};

