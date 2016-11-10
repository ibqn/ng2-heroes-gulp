/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    System.config({
        paths: {
            // paths serve as alias
            'npm:': 'js/'
        },
        // map tells the System loader where to look for things
        map: {
            // our app is within the app folder
            app: 'js/app',
            // angular bundles,
            '@angular': 'npm:angular',
            // other libraries
            'rxjs':                      'npm:rxjs',
            'angular-in-memory-web-api': 'npm:in-memory-web-api.umd.js'
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            app: {
                main: './main.js',
                defaultExtension: 'js'
            },
            '@angular': {
                defaultExtension: 'umd.js'
            },
            rxjs: {
                defaultExtension: 'js'
            }
        }
    });
})(this);
