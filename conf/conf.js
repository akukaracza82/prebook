exports.config = {
    framework: 'jasmine',
    jasmineNodeOpts: {defaultTimeoutInterval: 60000000},
    allScriptsTimeout: 15000,
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['spec.js'],
  }