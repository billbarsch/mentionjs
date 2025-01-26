import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const packageJson = require('./package.json');

export default [
    // UMD build
    {
        input: 'src/mentionjs.js',
        output: [
            {
                file: packageJson.main,
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
                file: packageJson.module,
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