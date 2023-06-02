/**
 * Export a World constructor which will be the scope of all step definitions.
 */
const zombie = require('zombie');

const { setWorldConstructor, World } = require('@cucumber/cucumber');

class CustomWorld extends World {
  browser = new zombie({ runScripts: false });
  constructor(options) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
