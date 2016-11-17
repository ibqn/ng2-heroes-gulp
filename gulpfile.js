//jshint node:true
//jshint esversion: 6
'use strict';

var gulp          = require('gulp'),
    gutil         = require('gulp-util'),
    sourcemaps    = require('gulp-sourcemaps'),
    filter        = require('gulp-filter'),
    gulpif        = require('gulp-if'),
    rename        = require("gulp-rename"),
    typescript    = require('gulp-typescript');

var fs   = require('fs'),
    path = require('path'),
    url  = require('url');

var exec = require('child_process').exec;

var defaultFile = "index.html";

var browserSync = require('browser-sync').create();

var tscConfig = require('./tsconfig.json');

// gulp should be called like this :
// $ gulp --type aot
var isProd = gutil.env.type === 'prod' || gutil.env.type === 'aot';


var sourcesPath = 'process/';

var targetsPath = 'builds/' + (isProd? 'release/' : 'development/');

var sources = {
    ts: sourcesPath + 'ts/**/*.ts',
    html: sourcesPath + 'html/**/*.html',
    css: sourcesPath + 'css/**/*.css',
    js: sourcesPath + 'js/**/*.js',
};

var targets = {
    css: targetsPath + 'css/',
    html: targetsPath,
    js: targetsPath + 'js/',
    ts: targetsPath  +  (isProd? '' : 'js/app/'),
};


gulp.task('copylibs', function() {
    if (isProd) {
        return gulp.src([
            'core-js/client/shim',
            'zone.js/dist/zone',
        ].map(function(i) { return 'node_modules/' + i + '.min.js*'; }))
        .pipe(gulp.dest(targets.js));
    }

    // angular dependencies: *js and *map files
    gulp.src([
        'core',
        'common',
        'compiler',
        'platform-browser',
        'platform-browser-dynamic',
        'http',
        'router',
        'forms',
        'upgrade',
    ].map(function(i) {
        return 'node_modules/@angular/' + i + '/bundles/' + i + '.umd.js*';
    }))
    .pipe(gulp.dest(targets.js + 'angular'));

    gulp.src([
        // move js and js.map files
        'node_modules/rxjs/**/*.js*',
    ])
    .pipe(gulp.dest(targets.js + 'rxjs'));

    gulp.src([
        // additional
        'angular-in-memory-web-api/bundles/in-memory-web-api.umd',
        'core-js/client/shim.min',
        'zone.js/dist/zone',
        'reflect-metadata/Reflect',
        'systemjs/dist/system.src',
    ].map(function(i) { return 'node_modules/' + i + '.js*'; }))
    .pipe(gulp.dest(targets.js));

    return gulp.src([
        sources.js,
    ])
    .pipe(gulp.dest(targets.js));
});


gulp.task('ts', function() {
    // filter main-aot.ts file in development
    var f = filter(['**', '!**/main-aot.ts']);

    return gulp.src([
        sources.ts,
    ])
    .pipe(gulpif(!isProd, f))
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(gulpif(!isProd, typescript(tscConfig.compilerOptions)))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(targets.ts));
});


gulp.task('css', function() {
    return gulp.src(sources.css)
    .pipe(gulp.dest(targets.css))
    .pipe(browserSync.stream());
});


gulp.task('html', function() {
    var f = filter([
        '**/index' + (isProd? '-aot' : '') + '.html'
    ]);

    gulp.src(sources.html)
    .pipe(f)
    .pipe(rename({basename: 'index'}))
    .pipe(gulp.dest(targets.html));

    var f = filter(['**', '!**/index*.html']);

    return gulp.src(sources.html)
    .pipe(f)
    .pipe(gulp.dest(targets.html));
});

var run_proc = function(cmd) {
    var proc = exec(cmd);
    proc.stderr.on('data', function(data) {
        process.stdout.write(data);
    });

    proc.stdout.on('data', function(data) {
        process.stdout.write(data);
    });

    proc.on('end', function() {
        process.exit()
    });
};

gulp.task('ngc', ['css', 'html', 'ts'], function() {
    if (isProd) {
        var cmd  = 'node_modules/.bin/ngc -p tsconfig-aot.json';
        return run_proc(cmd);
    }
});


gulp.task('rollup', ['ngc'], function() {
    if (isProd) {
        var cmd  = 'node_modules/.bin/rollup -c rollup.config.js';
        return run_proc(cmd);
    }
});

gulp.task('watch', function() {
    gulp.watch(sources.css, ['css'])
        .on('change', browserSync.reload);
    gulp.watch(sources.html, ['html'])
        .on('change', browserSync.reload);
    gulp.watch(sources.ts, ['ts'])
        .on('change', browserSync.reload);
    gulp.watch(sources.js, ['copylibs'])
        .on('change', browserSync.reload);
});


gulp.task('browser-sync', [
        'copylibs',
        'ts',
        'html',
        'css',
    ], function() {
        browserSync.init({
            server: {
                baseDir: targets.html,
            },
            // Middleware for serving Single Page Applications (SPA)
            middleware: [
                function (req, res, next) {
                    var fileName = url.parse(req.url);
                    fileName = fileName.href.split(fileName.search).join("");
                    var fileExists = fs.existsSync(targets.html + fileName);
                    if (!fileExists && fileName.indexOf("browser-sync-client") < 0) {
                        req.url = "/" + defaultFile;
                    }
                    return next();
                },
            ],
            port: 8080,
            reloadDelay: 300,
            reloadDebounce: 500
        });
});


gulp.task('default', [
    'copylibs',
    'ts',
    'html',
    'css',
    'watch',
    'browser-sync',
]);
