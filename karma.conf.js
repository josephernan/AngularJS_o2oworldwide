// Karma configuration
// Generated on Thu Jun 02 2016 12:52:28 GMT-0600 (MDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    // frameworks: ['mocha', 'chai'],
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'build/assets/js/bower-vendor.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/lodash/dist/lodash.js',

      'app/js/**/*.js',
      'tests/**/*.js'
    ],


    // list of files to exclude
    exclude: [
      // 'app/bower_components/**'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // 'build/js/**/*.js': ['eslint'],
      // 'build/js/**/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'], //['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome'],
    browsers: ['PhantomJS', 'Safari', 'Chrome', /*'Firefox'*/],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,


    plugins: [
        // 'karma-junit-reporter',
        'karma-safari-launcher',
        'karma-chrome-launcher',
        'karma-firefox-launcher',
        'karma-phantomjs-launcher',
        'karma-jasmine',
        'karma-chai',
        'karma-mocha',
        'karma-mocha-reporter'
    ],

    // // configure the reporter
    // coverageReporter: {
    //   type : 'lcov',
    //   dir : 'coverage/'
    // },

    // client: {
    //   mocha: {
    //     reporter: 'html', // change Karma's debug.html to the mocha web reporter
    //     ui: 'tdd'
    //   }
    // }

    // reporter options
    mochaReporter: {
      showDiff: true,
      output: 'minimal',
      // colors: {
      //   success: 'blue',
      //   info: 'bgGreen',
      //   warning: 'cyan',
      //   error: 'bgRed'
      // }
    }

    // junitReporter: {
    //     outputFile: 'test_out/unit.xml',
    //     suite: 'unit'
    // }
  })
}
