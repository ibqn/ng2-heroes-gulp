//jshint node:true
//jshint esversion: 6
'use strict';

var gulp          = require('gulp'),
    gutil         = require('gulp-util'),
    sourcemaps    = require('gulp-sourcemaps'),
    filter        = require('gulp-filter'),
    gulpif        = require('gulp-if'),
    typescript    = require('gulp-typescript');

var fs   = require('fs'),
    path = require('path'),
    url  = require('url');

var defaultFile = "index.html";

var browserSync = require('browser-sync').create();

var tscConfig = require('./tsconfig.json');


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
};


gulp.task('copylibs', function() {
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
    .pipe(sourcemaps.init())
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(targets.js + 'app'));
});


gulp.task('css', function() {
    return gulp.src(sources.css)
    .pipe(gulp.dest(targets.css))
    .pipe(browserSync.stream());
});


gulp.task('html', function() {
    var f = filter(['**', '!**/index-aot.html']);
    return gulp.src(sources.html)
    .pipe(gulpif(!isProd, f))
    .pipe(gulp.dest(targets.html));
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
