//jshint node:true
'use strict';

var path = require('path');

var gulp          = require('gulp'),
    gutil         = require('gulp-util'),
    sourcemaps    = require('gulp-sourcemaps'),
    typescript    = require('gulp-typescript');

var fs   = require('fs'),
    path = require('path'),
    url  = require('url');

var defaultFile = "index.html"

var browserSync = require('browser-sync').create();

var tscConfig = require('./tsconfig.json');


var isProd = gutil.env.type === 'prod';


var sourcesPath = 'process/';

var targetsPath = 'builds/development/';

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
    gulp.src([
        // angular
        'core/bundles/core',
        'common/bundles/common',
        'compiler/bundles/compiler',
        'platform-browser/bundles/platform-browser',
        'platform-browser-dynamic/bundles/platform-browser-dynamic',
        'http/bundles/http',
        'router/bundles/router',
        'forms/bundles/forms',
        'upgrade/bundles/upgrade',
    ].map(function(i) {
        return 'node_modules/@angular/' + i + '.umd.js*';
    }))
    .pipe(gulp.dest(targets.js + 'angular'));

    gulp.src([
        // move ja and js.map files
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
    return gulp.src([
        sources.ts,
    ])
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
    return gulp.src(sources.html)
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