var beforeCallCount = 0;
var beforeFeatureCallCount = 0;

module.exports = function() {
    this.Before(function(scenario) {
        console.log('---> Before hook called', ++beforeCallCount, 'time' + (beforeCallCount !== 1 ? 's' : ''));
    });

    this.Before('@sections', function(scenario) {
        console.log('---> A test tagged with @sections is about to be run');
    });

    this.Before('@badges', function(scenario) {
        console.log('---> A test tagged with @badges is about to be run');
    });

    this.registerHandler('BeforeFeature', function(ev, callback) {
        // Be careful as this.World is not set up yet!
        console.log('---> this.World?', typeof this.World);

        console.log('---> BeforeFeature hook called', ++beforeFeatureCallCount, 'time' + (beforeFeatureCallCount !== 1 ? 's' : ''));

        // Don't forget to make a callback!
        callback();
    });
};
