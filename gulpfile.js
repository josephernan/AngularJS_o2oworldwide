
var os = require('os');
var gulp = require( "gulp" );
var gutil = require( "gulp-util" );
var open = require('gulp-open');
var runSequence = require( 'run-sequence' );
var eslint = require( "gulp-eslint" );
var eslintReporter = require( "eslint-html-reporter" );
var formatter = require('eslint-friendly-formatter');
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
var ngAnnotate = require( "gulp-ng-annotate" );
var clean = require( "gulp-clean" );
var rename = require( "gulp-rename" );
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var jsonminify = require('gulp-jsonminify');
var concat = require( "gulp-concat" );
var uglify = require( "gulp-uglify" );
var htmlreplace = require( "gulp-html-replace" );
var cleanCSS = require( "gulp-clean-css" );
var replace = require( "gulp-replace" );
var notify = require( "gulp-notify" );
var watch = require( "gulp-watch" );
var es = require( "event-stream" );
var template = require( "gulp-template" );
var connect = require( "gulp-connect" );
var stripCode = require('gulp-strip-code');
var inject = require('gulp-inject');

/* Set this as true if you want to skip minification etc to debug the code */
var DEBUG_PROJECT = false;

var browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? 'google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));

var bower_root = "./app/bower_components/";
var bower_src = {
  js: [],
  css: [],
  images: [],
  fonts: []
};

function buildBowerSrc( packageLocation, list ) {
  list.push( bower_root + packageLocation );
}

var point_to_url_override = '';

/* Build locations */
var build_root = "./build/";

var build_path = {
  root: "", // build_path.root
  js: "assets/js/",
  css: "assets/css/",
  images: "assets/images/",
  json: "assets/json/",
  fonts: "assets/fonts/",
  libs: "assets/js/",
  views: "views/"
};

var add_inject = function (str, type) {
  var _build_path = build_path[type];
  var filename = (_build_path + str).substr(build_root.length - 1);
  src.inject[type].push(filename);
  return filename;
}

/**
* setup_build_path is here so that when build:dist is run it can point to a new
*    folder (i.e. './dist/')
*/
function setup_build_path(other_path) {
  build_root = (other_path !== undefined) ? './' + other_path + '/' : build_root;

  for (var i in build_path) {
    build_path[i] = build_root + build_path[i];
  }
}

function is_build_mobile() {
  return (build_root.indexOf('mobile') > -1);
}

function is_build_dist() {
  return (build_root.indexOf('dist') > -1);
}

function get_build_lang() {
  return build_root.replace('dist', '').replace('_', '').replace(/\W/g, '')
}

function variable_task_build(task) {
  // mobile/phoneGap:dependency START
  if (is_build_mobile()) {
    // task
    //   .pipe(replace("'assets/", "'/assets/'"))
    //   .pipe(replace('"assets/', '"/assets/'));
  } else {
    task.pipe(stripCode({
        start_comment: " mobile:phoneGap:dependency:START",
        end_comment: " mobile:phoneGap:dependency:END"
      }));
  }

  return task;
}

/* Source locations */
var src = {
  js: [ "./app/js/**/*.js" ],
  fonts: "./app/fonts/*",
  // sass: "./app/css/scss/*.scss",
  css: [ "./app/css/*.css", "./app/css/**/**/*.css" ],
  views: [ "./app/views/**/*.html", "!./app/views/index.{html,htm}" ],
  index: "./app/views/index.html",
  // libs: [ "./app/libs/*.js", "./app/libs/**/*.js" ],
  shim: "./app/shim/*.js",
  images: [ "./app/images/**/*" ],
  json: [ "./app/json/**/*.json", "./app/json/*.json" ],

  inject: {
    css: [],
    js: []
  }
};

/* Bower Includes
 *  Tip: Do not use minfied version of
 * Bower - CSS
 */
buildBowerSrc( "angular-loading-bar/build/loading-bar.css", bower_src.css );
buildBowerSrc( "bootstrap/dist/css/bootstrap.css", bower_src.css );

buildBowerSrc( "components-font-awesome/css/font-awesome.css", bower_src.css );

buildBowerSrc( "bootstrap-material-design/dist/css/bootstrap-material-design.css", bower_src.css );
buildBowerSrc( "bootstrap-material-design/dist/css/ripples.css", bower_src.css );
// buildBowerSrc( "snackbarjs/src/snackbar.css", bower_src.css );
// buildBowerSrc( "nouislider/src/nouislider.css", bower_src.css );

/* Bower - JS */
buildBowerSrc( "jquery/dist/jquery.js", bower_src.js );

buildBowerSrc( "datatables/media/js/jquery.dataTables.js", bower_src.js );

buildBowerSrc( "angular/angular.js", bower_src.js );
buildBowerSrc( "angular-animate/angular-animate.js", bower_src.js );

buildBowerSrc( "bootstrap/dist/js/bootstrap.js", bower_src.js );

// buildBowerSrc( "arrive/src/arrive.js", bower_src.js );
buildBowerSrc( "bootstrap-material-design/dist/js/material.js", bower_src.js );
buildBowerSrc( "bootstrap-material-design/dist/js/ripples.js", bower_src.js );
// buildBowerSrc( "snackbarjs/src/snackbar.js", bower_src.js );

buildBowerSrc( "angular-datatables/dist/angular-datatables.js", bower_src.js );
buildBowerSrc( "angular-datatables/dist/css/angular-datatables.min.css", bower_src.css );

buildBowerSrc( "angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.min.js", bower_src.js );
buildBowerSrc( "angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css", bower_src.css );

buildBowerSrc( "angular-local-storage/dist/angular-local-storage.js", bower_src.js );
buildBowerSrc( "angular-cookies/angular-cookies.js", bower_src.js );
buildBowerSrc( "angular-bootstrap-show-errors/src/showErrors.js", bower_src.js );
buildBowerSrc( "oclazyload/dist/ocLazyLoad.js", bower_src.js );
buildBowerSrc( "angular-ui-utils/ui-utils.js", bower_src.js );
buildBowerSrc( "angular-bootstrap/ui-bootstrap.js", bower_src.js );
buildBowerSrc( "angular-bootstrap/ui-bootstrap-tpls.js", bower_src.js );

buildBowerSrc( "angular-resource/angular-resource.js", bower_src.js );
buildBowerSrc( "angular-route/angular-route.js", bower_src.js );
buildBowerSrc( "angular-sanitize/angular-sanitize.js", bower_src.js );
buildBowerSrc( "moment/moment.js", bower_src.js );
buildBowerSrc( "angular-moment/angular-moment.js", bower_src.js );
buildBowerSrc( "angular-shims-placeholder/dist/angular-shims-placeholder.js", bower_src.js );

buildBowerSrc( "angular-ui-router/release/angular-ui-router.js", bower_src.js );
buildBowerSrc( "angular-loading-bar/build/loading-bar.js", bower_src.js );
/* angular-translate */
buildBowerSrc( "angular-translate/angular-translate.js", bower_src.js );
buildBowerSrc( "angular-translate-storage-cookie/angular-translate-storage-cookie.js", bower_src.js );
buildBowerSrc( "angular-translate-storage-local/angular-translate-storage-local.js", bower_src.js );
buildBowerSrc( "angular-translate-loader-partial/angular-translate-loader-partial.js", bower_src.js );
buildBowerSrc( "angular-translate-handler-log/angular-translate-handler-log.js", bower_src.js );

buildBowerSrc( "ngInfiniteScroll/build/ng-infinite-scroll.js", bower_src.js );
buildBowerSrc( "angular-retina/build/angular-retina.js", bower_src.js );

buildBowerSrc( "pnotify/pnotify.core.css", bower_src.css );
buildBowerSrc( "pnotify/pnotify.buttons.css", bower_src.css );

buildBowerSrc( "pnotify/pnotify.core.js", bower_src.js );
buildBowerSrc( "pnotify/pnotify.confirm.js", bower_src.js );
buildBowerSrc( "pnotify/pnotify.buttons.js", bower_src.js );
buildBowerSrc( "angular-pnotify/src/angular-pnotify.js", bower_src.js );
buildBowerSrc( "lodash/dist/lodash.js", bower_src.js );

/* Bower - Fonts */
buildBowerSrc( "bootstrap/dist/fonts/*.{otf,eot,svg,ttf,woff,woff2}", bower_src.fonts );
buildBowerSrc( "components-font-awesome/fonts/fonts/*.{eot,otf,svg,ttf,woff,woff2}", bower_src.fonts );
buildBowerSrc( "material-design-icons/iconfont/*.{eot,otf,svg,ttf,woff,woff2}", bower_src.fonts );

/*
    custom is for files ($k) that need to be moved at build to ($v)
    Note: custom is evaluated last in the build process so you could technicaly
            override something that was previously built
*/
var custom = {
  "./app/bower_components/bootstrap/dist/css/bootstrap.css.map": /* build_root + */ "assets/css/",
  "./app/bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff2": /* build_root + */ "assets/fonts/",
  // "./app/bower_components/fontawesome/fonts/*": /* build_root + */ "assets/css/fonts/",
  "./app/bower_components/moment/locale/zh-cn.js": /* build_root + */ "assets/js/moment_locale/",
  "./app/libs/css/fonts.css" :  /* build_root + */ "assets/css/"
}

/* base languages should be here */
var languages = [
  'en',
  'zh-hans'
];

/*
---- Clean Section ----
*/

/*
    We coullllddd clean like this... or we could just clean the build directory
*/
// gulp.task( "clean", [
//   "clean:css",
//   "clean:js",
//   "clean:images",
//   "clean:json"
//   "clean:html",
//   "clean:fonts",
//   "clean:libs"
//   ], function () {
//   return gulp.src( build_path.root + "*.{htm,html}" )
//     .pipe( notify( "Cleaned all distribution files." ) );
// } );

function _run_clean(build_type) {
  setup_build_path((build_type !== undefined) ? build_type : 'build');

  return gulp.src( build_root, {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
}

gulp.task( "clean", function () {
  _run_clean();
} );

gulp.task( "clean:dist", function () {
  _run_clean('dist');
} );

gulp.task( "clean:mobile", function () {
  _run_clean('mobile');
} );

gulp.task( "clean:dev", function () {
  _run_clean('dev');
} );

gulp.task( "clean:css", function () {
  return gulp.src( [
      build_path.css + "*.css",
      build_path.css + "**/*.css"
    ], {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
} );

gulp.task( "clean:js", function () {
  return gulp.src( build_path.js + "*.js", {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
} );

gulp.task( "clean:html", function () {
  return gulp.src( [
      build_root + "*.{html,htm}",
      build_path.views + "**/*.{html,htm}"
    ], {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
} );

gulp.task( "clean:fonts", function () {
  return gulp.src( build_path.fonts, {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
} );

gulp.task( "clean:libs", function () {
  return gulp.src( build_path.libs, {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
} );

gulp.task( "clean:zip", function () {
  return gulp.src( build_path.zip, {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
} );

gulp.task( "clean:images", function () {
  return gulp.src( build_path.images + "*", {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
} );

gulp.task( "clean:json", function () {
  return gulp.src( build_path.json + "*.json", {
      read: false
    } )
    .pipe( clean( {
      force: true
    } ) );
} );

/* ------------------------------------------ */

/* ---- Build Section ---- */

function _run_build(build_type, cb) {
  setup_build_path((build_type !== undefined && build_type !== null) ? build_type : 'build');
  cb = (cb !== undefined) ? cb : function() {};

  return runSequence(
    (is_build_dist()) ? "dummy" : "lint",
    [
      "build:css",
      "build:js",
      "build:images",
      "build:json",
      "build:html",
      "build:fonts",
      "build:js:bower",
      "build:js:shim"
    ],
    [
      "build:custom",
      (false && is_build_dist()) ? "generate-favicon" : "lint"
    ],
    cb
  );

}

gulp.task( "build", function (cb) {
  return _run_build('build', cb);
} );

gulp.task( "build:dist:en", function (cb) {
  point_to_url_override = 'o2oworldwide.com';
  return _run_build('dist_en', cb);
} );

gulp.task( "build:dist:zh", function (cb) {
  point_to_url_override = 'o2ohq.com';
  return _run_build('dist_zh', cb);
} );

gulp.task( "build:mobile", function (cb) {
  point_to_url_override = 'o2ohq.com';
  return _run_build('mobile', cb);
} );

gulp.task( "build:dev", function (cb) {
  point_to_url_override = 'devo2o.com';
  return _run_build('dev', cb);
} );

gulp.task( "build:css", [ "build:css:bower" ], function () {
  var filename = "app.css"; //"app." + BUILD_DATE_STAMP + ".css";
  var task = gulp.src( src.css );

  if (is_build_dist() || DEBUG_PROJECT) {
    task = task.pipe(cleanCSS({}));
  }

  var ret = task
    .pipe( concat( filename ) )
    .pipe( gulp.dest( build_path.css ) );

  add_inject(filename, 'css');
  return ret;
} );

/* CSS - Bower */

gulp.task( "build:css:bower", function () {
  var filename = "vendor.css"; // "vendor." + BUILD_DATE_STAMP + ".css";
  var task = gulp.src( bower_src.css );

  if (is_build_dist() || DEBUG_PROJECT) {
    task = task.pipe(cleanCSS({}));
  }
  var ret = task
    .pipe( concat( filename ) )
    .pipe( gulp.dest( build_path.css ) );

  add_inject(filename, 'css');
  return ret;
} );

gulp.task( "build:custom", function () {
  for ( var k in custom ) {
    if ( custom.hasOwnProperty( k ) ) {
      gutil.log("" + k + " -> " + custom[k]);
      gulp.src( k )
        .pipe( gulp.dest( build_root + custom[ k ] ) );
    }
  }

  /* FONT AWSOME! */

  return gulp.src( '.app/bower_components/components-font-awesome/fonts/**.*' ) 
    .pipe( gulp.dest( build_root + 'assets/fonts' ) ); 
} );

/* JS */
gulp.task( "build:js", function () {
  var filename = "app.js"; // "app." + BUILD_DATE_STAMP + ".js";
  var task = gulp.src( src.js )
    .pipe(replace('__BUILD_POINT_TO_OVERRIDE__', point_to_url_override));

  task = variable_task_build(task);

  if (is_build_dist() || DEBUG_PROJECT) {
    task = task.pipe( ngAnnotate() ) // Make the NG code minify safe.
      .pipe( uglify( {
        outSourceMap: true,
        warnings: true
      } ) );
  }

  var ret = task
    .pipe( concat( filename ) )
    .pipe( gulp.dest( build_path.js ) );

  add_inject(filename, 'js');
  return ret;
} );

/* Bower Vendor */

gulp.task( "build:js:bower", function () {
  var filename = "bower-vendor.js"; // "bower-vendor." + BUILD_DATE_STAMP + ".js";
  var task = gulp.src( bower_src.js );

  if (is_build_dist() || DEBUG_PROJECT) {
    task = task.pipe( ngAnnotate() ) // Make the NG code minify safe.
      .pipe( uglify( {
        outSourceMap: true,
        warnings: true
      } ) );
  }

  var ret = task
    .pipe( concat( filename ) )
    .pipe( gulp.dest( build_path.libs ) );

  add_inject(filename, 'js');
  return ret;
} );

/* Shim JS */

gulp.task( "build:js:shim", function () {
  return gulp.src( src.shim )
    .pipe( gulp.dest( build_path.libs ) );
} );

/* Images */

gulp.task( "build:images", function () {
  return gulp.src( src.images )
    .pipe( gulp.dest( build_path.images ) );
} );

gulp.task( "build:json", /* [ 'build:translate' ], */ function () {
  var task = gulp.src( src.json );

  if (is_build_dist()) {
    task = task.pipe(jsonminify());
  }

  return task.pipe( gulp.dest( build_path.json ) );
} );

var json_key_builder = function ( current_key, data, save ) {
  if ( typeof data === 'object' ) {
    for ( var key in data ) {
      json_key_builder(
        current_key + '.' + key,
        data[ key ],
        save
      );
    }
  } else if ( data.constructor === Array ) {
    Object.keys( data ).forEach( function ( key ) {
      json_key_builder(
        current_key + '.' + key,
        data[ key ],
        save
      );
    } );
  } else {
    save[ current_key ] = data;
  }
}

// gulp.task( "build:translate", function () {
//   runSequence(
//     "build:translate:json",
//     "build:translate:csv"
//   );
// } );

// gulp.task( "build:translate:json", function () {
//   var tasks = [];
//   for ( var lang_index in languages ) {
//     var lang = languages[ lang_index ];
//
//     // builds master-{{lang}}.json
//     var task = gulp.src( 'app/json/translate/**/' + lang + '.json' )
//       .pipe( require( "gulp-jsoncombine" )( 'master-' + lang + '.json', function ( data ) {
//         var master_json = {};
//
//         for ( var key in data ) {
//           for ( var kk in data[ key ] ) {
//             master_json[ kk ] = data[ key ][ kk ];
//           }
//         }
//
//         return new Buffer( JSON.stringify( master_json ) );
//       } ) )
//       .pipe( gulp.dest( build_root + 'assets/json/translate/' ) );
//     tasks.push( task );
//   }
//
//   // calling es.concat(task1, task2)
//   return es.concat.apply( this, tasks );
// } );

// gulp.task( "build:translate:csv", function () {
//   var tasks = [];
//   for ( var lang_index in languages ) {
//     var lang = languages[ lang_index ];
//
//     // builds master-{{lang}}.json
//     var task = gulp.src( build_root + 'assets/json/translate/master-' + lang + '.json' )
//       .pipe( require( "gulp-data-json" )() )
//       .pipe( require( "gulp-tap" )( function ( file ) {
//         var kv = {},
//           ret_str = "\"keys\",\"text\" \n";
//
//         json_key_builder( '', file.data, kv );
//
//         for ( var k in kv ) {
//           ret_str += '"' + k + '","' + kv[ k ].toString().replace( '"', "'" ) + "\"\r\n";
//         }
//
//         file.contents = new Buffer( ret_str );
//       } ) )
//       .pipe( require( 'gulp-convert-encoding' )( {
//         to: 'utf8'
//       } ) )
//       .pipe( rename( {
//         prefix: 'master-',
//         basename: lang,
//         extname: '.csv'
//       } ) )
//       .pipe( gulp.dest( build_root + 'assets/json/translate/' ) );
//   }
//
//   // calling es.concat(task1, task2)
//   return es.concat.apply( this, tasks );
// } );

/* Image - Bower */

gulp.task( "build:images:bower", function () {
  return gulp.src( bower_src.images )
    .pipe( gulp.dest( build_path.images ) );
} );

/* Fonts */

gulp.task( "build:fonts", [ "build:fonts:bower" ], function () {
  return gulp.src( src.fonts )
    .pipe( gulp.dest( build_path.fonts ) );
} );

/* Fonts - Bower */

gulp.task( "build:fonts:bower", function () {
  return gulp.src( bower_src.fonts )
    .pipe( gulp.dest( build_path.fonts ) );
} );

/* Views */

gulp.task( "build:html:views", function () {
    // This picks up files like this:
  //   partials/date-picker/year.html (as well as month.html, day.html)
  //   partials/expanded-combo-box/combobox.html
  //   partials/forms/feedback.html (as well as survey.html, contact.html)
  // Returns modules like this:
  //   datePicker, expandedComboBox, forms
  var task = gulp.src(src.views);

  if (is_build_dist() || DEBUG_PROJECT) {
    task = task.pipe(minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }));
  }

      // .pipe(ngHtml2Js({
      //     moduleName: function (file) {
      //         var pathParts = file.path.split('/');
      //         var folder = pathParts[pathParts.length - 2];
      //         return folder.replace(/-[a-z]/g, function (match) {
      //             return match.substr(1).toUpperCase();
      //         });
      //     }
      // }))
      // .pipe(concat("partials.min.js"))
      // .pipe(uglify())
      // .pipe(gulp.dest(build_path.views));

  // var task = gulp.src( src.views );

  task = variable_task_build(task);

  task.pipe( gulp.dest( build_path.views ) );
  return task;
} );

// TODO: Add styles and js dynamically.
gulp.task( "build:html", [ "build:html:views" ], function () {
  var task = gulp.src( src.index );

  if (is_build_dist() || DEBUG_PROJECT) {
    task = task.pipe(minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }));
  }

  task = variable_task_build(task);

  task.pipe( gulp.dest( build_path.root ) );
  return task;
} );

/*
---- Main ignition ----
*/

gulp.task( "default", function(cb) {
  return runSequence("watch", "server", "lint:open", cb);
});


gulp.task( "watch", [ "build", "watch:build" ], function () {
} );

gulp.task( "watch:build", function () {
  gulp.watch( src.js, [ "build:js" ] );
  gulp.watch( src.libs, [ "build:js:libs" ] );
  gulp.watch( src.css, [ "build:css" ] );
  gulp.watch( src.views, [ "build:html" ] );
  gulp.watch( src.index, [ "build:html" ] );
  gulp.watch( src.fonts, [ "build:fonts" ] );
  gulp.watch( src.images, [ "build:images" ] );
  gulp.watch( src.json, [ "build:json" ] );
} );

gulp.task( "watch:reload", function () {
  return gulp.src( build_root + '**/*' )
    .pipe(connect.reload());
} );


gulp.task( "server", function (cb) {
  runSequence(
    "connect",
    "connect:open",
    cb
  );
});

gulp.task("connect", function() {
  connect.server( {
    root: ["./build/"], //"./build/",
    port: 9022,
    base: "http://localhost",
    livereload: true
  } );
});

gulp.task("connect:open", function() {
  return gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:9022',app: browser}));
});

gulp.task("lint", function (cb) {
  return runSequence(
    "_lint",
    cb
  );
});

gulp.task("_lint", function () {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return gulp.src(
      [
        'app/js/**/*.js', // javascript
        'app/json/**/*.json', // json
        // 'app/css/**/*.css', // json
        'app/views/partials/**/*.html' // html
      ]
    )
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint({
      stopOnError: false,
      stopOnWarning: true,
      showWarnings: true,
    }))
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format(eslintReporter, function(results) {
        fs.writeFileSync(build_root + 'eslint-report-results.html', results);
      })
    );
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    // .pipe(eslint.failAfterError());
});
gulp.task("lint:open", function () {
  gulp.src(build_root + 'eslint-report-results.html')
    .pipe(open({app:browser}))
});

gulp.task("dummy");

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
  var lang = get_build_lang();
  gutil.log(lang);
  var app_name = ('O2O | ') + ((lang === 'en') ? 'HQ' : '环球商网');

	realFavicon.generateFavicon({
		masterPicture: build_root.substr(2) + '../../other/assets/store_app_icon3_' + lang + '.png',
		dest: build_root + 'assets/images/favicon/',
		iconsPath: '/assets/images/favicon/',
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
				backgroundColor: '#ffffff',
				margin: '14%',
				appName: app_name
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#1A237E',
				onConflict: 'override',
				appName: app_name
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#1A237E',
				manifest: {
					name: app_name,
					startUrl: 'http://store.' + point_to_url_override,
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				}
			},
			safariPinnedTab: {
				pictureAspect: 'blackAndWhite',
				threshold: 46.5625,
				themeColor: '#1A237E'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false
		},
		versioning: {
			paramName: 'v',
			paramValue: '5.5&' + lang
		},
		markupFile: build_root + 'assets/faviconData.json'
	}, function() {
		done();
	});
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
	gulp.src([ 'TODO: List of the HTML files where to inject favicon markups' ])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(build_root + 'assets/faviconData.json')).favicon.html_code))
		.pipe(gulp.dest('TODO: Path to the directory where to store the HTML files'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(build_root + 'assets/faviconData.json')).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});
