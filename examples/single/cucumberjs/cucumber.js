module.exports = {
  default: {
    format: ['progress', 'cucumberjs-qase-reporter'],
    require: ['step_definitions/**/*.js'],
    publishQuiet: true,
  },
};
