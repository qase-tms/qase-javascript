/**
 * Export a World constructor which will be the scope of all step definitions.
 */
var zombie = require('zombie');
var worldCallCount = 0;

const { setWorldConstructor, World } = require('@cucumber/cucumber')

class CustomWorld extends World {
    browser = new zombie({ runScripts: false });
    constructor(options) {
        super(options)
    }
}

setWorldConstructor(CustomWorld)
