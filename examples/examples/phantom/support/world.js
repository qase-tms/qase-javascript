/**
 * Export a World constructor which will be the scope of all step definitions.
 */
var phantom = require('phantom');
var currentBrowser;
var currentPage;

/**
 * Private method for getting a browser, re-using any already created one
 *
 * @return Promise
 */
function getBrowser() {
	return new Promise(function (resolve, reject) {
		if (currentBrowser && typeof currentBrowser === 'object') {
			return resolve(currentBrowser);
		}
		return phantom.create().then(function(browser) {
			currentBrowser = browser;
			resolve(currentBrowser);
		}).catch(function() {
			reject();
		});
	});
}

/**
 * Browser helpers to be used in steps
 */
var browser = {

	/**
	 * Visit a URL
	 *
	 * @param string url
	 * @return Promise
	 */
	visit: function visit(url) {
		return getBrowser()
			.then(function(browser) {
				return browser.createPage();
			}).then(function(page) {
				currentPage = page;
				return page.open(url);
			}).catch(function() {
				throw new Error('URL ' + url + ' could not be opened');
			});
	},

	assert: {
		/**
		 * Check if an element exists in the current page
		 *
		 * @param string selector - CSS selector
		 * @param string message - An error message to throw if element not found
		 */
		element: function element(selector, message) {
			if (!currentPage) {
				throw new Error('Cannot find any element as no current page!');
			}

			return currentPage.evaluate(function(selector) {
				return document.querySelectorAll(selector).length;
			}, selector).then(function(elementCount) {
				if (!elementCount) {
					throw new Error(message || 'The selector "' + selector + '" could not be found');
				}
			});
		}
	},

	/**
	 * Close the current browser
	 *
	 * @return void
	 */
	exit: function() {
		if (currentBrowser && typeof currentBrowser === 'object') {
			currentBrowser.exit();
			currentBrowser = false;
		}
	}
};

function World() {
	this.browser = browser;
}

module.exports = function(callback) {
    this.World = World;
};
