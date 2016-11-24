//jshint node:true
//jshint esversion: 6
'use strict';

const gulp          = require('gulp'),
      gutil         = require('gulp-util'),
      sourcemaps    = require('gulp-sourcemaps'),
      filter        = require('gulp-filter'),
      gulpif        = require('gulp-if'),
      rename        = require("gulp-rename"),
      clean         = require('gulp-clean'),
      typescript    = require('gulp-typescript');

const fs   = require('fs'),
      path = require('path'),
      url  = require('url');

const exec = require('child_process').exec;

const defaultFile = "index.html";

const browserSync = require('browser-sync').create();

const tscConfig = require('./tsconfig.json');

// gulp should be called like this :
// $ gulp --type aot
const isProd = gutil.env.type === 'prod' || gutil.env.type === 'aot';

const isWin = /^win/.test(process.platform);


let sourcesPath = 'process/';

let targetsPath = 'builds/' + (isProd ? 'release/' : 'development/');

let sources = {
    ts: sourcesPath + 'ts/**/*.ts',
    html: sourcesPath + 'html/**/*.html',
    css: sourcesPath + 'css/**/*.css',
    js: sourcesPath + 'js/**/*.js',
};

let targets = {
    css: targetsPath + (isProd ? '' : 'css/'),
    html: targetsPath,
    js: targetsPath + 'js/',
    ts: targetsPath  +  (isProd ? '' : 'js/app/'),
};


gulp.task('copylibs', () => {
    if (isProd) {
        return gulp.src([
            'core-js/client/shim',
            'zone.js/dist/zone',
        ].map(i => { return 'node_modules/' + i + '.min.js*'; }))
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
    ].map(i => {
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
    ].map(i => { return 'node_modules/' + i + '.js*'; }))
    .pipe(gulp.dest(targets.js));

    return gulp.src([
        sources.js,
    ])
    .pipe(gulp.dest(targets.js));
});


gulp.task('ts', () => {
    return gulp.src([
        sources.ts,
    ])
    // filter main-aot.ts file in development
    .pipe(filter([
        '**',
        '!**/main' + (isProd ? '' : '-aot') + '.ts'
    ]))
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(gulpif(!isProd, typescript(tscConfig.compilerOptions)))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(targets.ts));
});


gulp.task('css', () => {
    return gulp.src(sources.css)
    .pipe(gulp.dest(targets.css))
    .pipe(browserSync.stream());
});


gulp.task('html', () => {
    gulp.src(sources.html)
    .pipe(filter([
        '**/index' + (isProd ? '-aot' : '') + '.html'
    ]))
    .pipe(rename({basename: 'index'}))
    .pipe(gulp.dest(targets.html));

    return gulp.src(sources.html)
    .pipe(filter(['**', '!**/index*.html']))
    .pipe(gulp.dest(targets.html));
});


// helper function for running ngc and tree shaking tasks
const run_proc = (cmd, callBack, options) => {
    if (!isProd) return;
    let proc = exec(cmd, (err, stdout, stderr) => {
        if (options === undefined) options = {};
        if (options.outFilter !== undefined) stdout = options.outFilter(stdout);
        if (options.errFilter !== undefined) stderr = options.errFilter(stderr);
        process.stdout.write(stdout);
        process.stdout.write(stderr);
        callBack(err);
    });
};


gulp.task('ngc', ['css', 'html', 'ts'], cb => {
    let cmd  = 'node_modules/.bin/ngc -p tsconfig-aot.json';
    if (isWin) {
        cmd  = '"node_modules/.bin/ngc" -p tsconfig-aot.json';
    }
    return run_proc(cmd, cb);
});


gulp.task('rollup', ['ngc'], cb => {
    let cmd  = 'node_modules/.bin/rollup -c rollup.config.js';
    if (isWin) {
        cmd  = '"node_modules/.bin/rollup" -c rollup.config.js';
    }
    cmd += ' && gzip --force builds/release/js/build.js';
    // Filter known warning messages!
    const errFilter = (messages) => {
        const warningMsg = /The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten\./;
        return messages.split('\n').filter(line => !warningMsg.test(line)).join('\n');
    };
    return run_proc(cmd, cb, { errFilter: errFilter });
});


let rollUp = isProd ? ['rollup'] : [];

gulp.task('watch', () => {
    gulp.watch(sources.css, ['css'].concat(rollUp))
        .on('change', browserSync.reload);
    gulp.watch(sources.html, ['html'].concat(rollUp))
        .on('change', browserSync.reload);
    gulp.watch(sources.ts, ['ts'].concat(rollUp))
        .on('change', browserSync.reload);
    gulp.watch(sources.js, ['copylibs'])
        .on('change', browserSync.reload);
    gulp.watch(targets.js + '*.js')
        .on('change', browserSync.reload);
});


gulp.task('browser-sync', [
    'copylibs',
    'ts',
    'html',
    'css',
].concat(rollUp), () => {
    let baseDirs = isProd ? [targets.html] : [targets.html, targets.css];
    browserSync.init({
        server: baseDirs,
        files: ['./**/*.{html,css,js}'],
        watchOptions: {
            ignored: 'node_modules'
        },
        // Middleware for serving Single Page Applications (SPA)
        middleware: [
            require("connect-logger")({
                //format: "%date %status %method %url (%time)"
                // default: %date %status %method %url (%route - %time)
            }),
            (req, res, next) => {
                let fileName = url.parse(req.url);
                fileName = fileName.href.split(fileName.search).join("");
                let fileExists = baseDirs
                .map(e => fs.existsSync(e + fileName))
                .some(e => e);
                if (!fileExists && fileName.indexOf("browser-sync-client") < 0) {
                    req.url = "/" + defaultFile;
                }
                return next();
            },
            (req, res, next) => {
                let fileName = url.parse(req.url);
                fileName = fileName.href.split(fileName.search).join("");
                if(fileName.match(/\.gz$/g)) {
                    //res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Encoding', 'gzip');
                }
                return next();
            },
        ],
        port: 8080,
        reloadDelay: 300,
        reloadDebounce: 500
    });
});


gulp.task('clean', () => {
    return gulp.src(targetsPath, {read: false})
    .pipe(clean());
});


gulp.task('default', [
    'copylibs',
    'ts',
    'html',
    'css',
    'watch',
    'browser-sync',
]);
