// Cypress only looks for reporters in the project directory, so it may miss hoisted packages in npm workspaces
module.exports = require('cypress-multi-reporters');
