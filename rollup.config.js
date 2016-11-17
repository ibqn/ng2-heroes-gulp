//jshint esversion: 6

import rollup      from 'rollup';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs    from 'rollup-plugin-commonjs';
import uglify      from 'rollup-plugin-uglify';

const entryPath = 'builds/release/';

//paths are relative to the execution path
export default {
    entry: entryPath + 'main-aot.js',
    dest: entryPath + 'js/build.js', // output a single application bundle
    sourceMap: true,
    sourceMapFile: entryPath + 'js/build.js.map',
    format: 'iife',
    plugins: [
        nodeResolve({
            jsnext: true,
            module: true
        }),
        commonjs({
            include: ['node_modules/rxjs/**']
        }),
        uglify()
    ]
};