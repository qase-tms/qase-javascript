var phantom = require('phantom');

module.exports = function() {
    // Close the browser after each scenario
    this.After(function(scenario, callback) {
        this.browser.exit();
        callback();
    });
};
