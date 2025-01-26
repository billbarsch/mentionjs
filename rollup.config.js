const babel = require('@rollup/plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');

const packageJson = require('./package.json');

module.exports = [
    // UMD build
    {
        input: 'src/mentionjs.js',
        output: [
            {
                file: 'dist/mentionjs.js',
                format: 'umd',
                name: 'MentionJS',
                sourcemap: true
            },
            {
                file: 'dist/mentionjs.min.js',
                format: 'umd',
                name: 'MentionJS',
                plugins: [terser()],
                sourcemap: true
            }
        ],
        plugins: [
            resolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**'
            })
        ]
    },
    // ESM build
    {
        input: 'src/mentionjs.js',
        output: [
            {
                file: 'dist/mentionjs.esm.js',
                format: 'esm',
                sourcemap: true
            }
        ],
        plugins: [
            resolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**'
            })
        ]
    }
]; 