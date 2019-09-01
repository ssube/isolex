import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import multiEntry from 'rollup-plugin-multi-entry';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const metadata = require('../package.json');

const bundle = {
	external: [
		'async_hooks',
	],
	input: [
		'src/index.ts',
		'test/harness.ts',
		'test/**/Test*.ts',
	],
	manualChunks(id) {
		if (id.includes('/test/') || id.includes('/node_modules/')) {
			return 'test';
		}

		if (id.includes('/src/')) {
			return 'main';
		}

		return 'index';
	},
	output: {
		dir: 'out/',
		chunkFileNames: '[name].js',
		entryFileNames: 'entry-[name].js',
		format: 'cjs',
		sourcemap: true,
		banner: () => {
			return '\n';
		},
	},
	plugins: [
		multiEntry(),
		json(),
		replace({
			delimiters: ['{{ ', ' }}'],
			values: {
				APP_NAME: metadata.name,
				APP_VERSION: metadata.version,
				BUILD_JOB: process.env['CI_JOB_ID'],
				BUILD_RUNNER: process.env['CI_RUNNER_DESCRIPTION'],
				GIT_BRANCH: process.env['CI_COMMIT_REF_SLUG'],
				GIT_COMMIT: process.env['CI_COMMIT_SHA'],
				NODE_VERSION: process.env['NODE_VERSION'],
			},
		}),
		resolve({
			preferBuiltins: true,
		}),
		commonjs({
			namedExports: {
				'node_modules/chai/index.js': [
					'expect',
					'use',
				],
				'node_modules/lodash/lodash.js': [
					'isFunction',
					'isMap',
					'isNil',
					'isString',
					'kebabCase',
				],
			},
		}),
    		typescript({
			cacheRoot: 'out/cache/rts2',
			rollupCommonJSResolveHack: true,
		}),
	],
};

export default [
	bundle,
];
