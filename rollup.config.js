import resolve from '@rollup/plugin-node-resolve';
import vue from 'rollup-plugin-vue'
import htmlTemplate from 'rollup-plugin-generate-html-template';
import commonJS from '@rollup/plugin-commonjs';
import dev from 'rollup-plugin-dev'
import livereload from 'rollup-plugin-livereload'
import replace from '@rollup/plugin-replace'
import { terser } from "rollup-plugin-terser";
import clear from 'rollup-plugin-clear'

const isProduction = process.env.production;
const distDir = 'src/front/dist';

export default [
    {
        external: ['bhex'],
        input: { core: 'src/common/bhex/BHex.Drawing.js' },
        output: {
            format: 'iife',
            dir: distDir,
            name: 'BHex',
            entryFileNames: `[name]-[hash].js`,
        },
        plugins: isProduction ?
            [
                clear({ targets: [distDir] }),
                commonJS(),
                terser(),
                htmlTemplate({
                    template: 'src/front/app/index.html',
                    target: `${distDir}/index.html`
                })
            ] :
            [
                clear({ targets: [distDir] }),
                commonJS(),
                htmlTemplate({
                    template: 'src/front/app/index.html',
                    target: `${distDir}/index.html`
                })
            ]
    },
    {
        external: ['konva', 'vue', 'vue-konva', 'vue-router', 'axios', 'jsnlog', 'bhex'],
        input: { app : 'src/front/app/main.js' },
        output: {
            format: 'iife',
            sourcemap: !isProduction,
            dir: distDir,
            entryFileNames: `$[name]-[hash].js`,
            globals: {
                'konva': 'Konva',
                'vue': 'Vue',
                'vue-konva': 'VueKonva',
                'vue-router': 'VueRouter',
                'axios': 'axios',
                'jsnlog': 'JL',
                'bhex': 'BHex'
            }
        },
        plugins: isProduction ?
            [
                clear({ targets: [distDir] }),
                vue({ needMap: false /* hack from https://github.com/vuejs/rollup-plugin-vue/issues/238 */ }),
                htmlTemplate({
                    template: `${distDir}/index.html`,
                    target: `${distDir}/index.html`,
                    attrs: [ 'defer' ],
                }),
                replace({
                    'process.env.NODE_ENV': '"production"'
                }),
                resolve({
                    jsnext: true, browser: true
                }),
                commonJS(),
                terser()
            ] :
            [
                clear({ targets: [distDir] }),
                vue({ needMap: false /* hack from https://github.com/vuejs/rollup-plugin-vue/issues/238 */ }),
                htmlTemplate({
                    template: `${distDir}/index.html`,
                    target: `${distDir}/index.html`,
                    attrs: [ 'defer' ],
                }),
                replace({
                    'process.env.NODE_ENV': '"development"'
                }),
                resolve({
                    jsnext: true, browser: true
                }),
                commonJS(),
                dev({
                    dirs: [distDir, 'src/front/assets'],
                    proxy: { '/*': 'localhost:3000' },
                    port: 3001
                }),
                livereload(),
            ],
        onwarn: function (warning) {
            if (warning.code === 'THIS_IS_UNDEFINED') { return; }

            console.warn(warning.message);
        }
    }];