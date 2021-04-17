import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import multiEntry from '@rollup/plugin-multi-entry';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import yaml from '@rollup/plugin-yaml';
import { join } from 'path';
import { eslint } from 'rollup-plugin-eslint';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const { chunkMap } = require('./map.js');
const { plugins } = require('./project.js');

const flag_debug = process.env['DEBUG'] === 'TRUE';
const flag_devel = process.env['NODE_ENV'] === 'production';
const flag_serve = flag_devel || process.env['SERVE'] === 'TRUE';

const metadata = require('../../package.json');
const chunks = require('./chunks.json').chunks;
const external = require('./external.json').names;

const rootPath = process.env['ROOT_PATH'];
const targetPath = process.env['TARGET_PATH'];

const bundle = {
	external,
	input: {
		include: [
			join(rootPath, 'src', 'index.ts'),
			join(rootPath, 'test', 'harness.ts'),
			join(rootPath, 'test', '**', 'Test*.ts'),
		],
	},
	manualChunks: chunkMap(chunks, flag_debug),
	output: {
		dir: targetPath,
		chunkFileNames: '[name].js',
		entryFileNames: 'entry-[name].js',
		exports: 'named',
		format: 'cjs',
		minifyInternalExports: false,
		sourcemap: true,
	},
	plugins: [
		multiEntry(),
		json(),
		yaml(),
		replace({
			delimiters: ['{{ ', ' }}'],
			values: {
				BUILD_JOB: process.env['CI_JOB_ID'],
				BUILD_RUNNER: process.env['CI_RUNNER_DESCRIPTION'],
				GIT_BRANCH: process.env['CI_COMMIT_REF_SLUG'],
				GIT_COMMIT: process.env['CI_COMMIT_SHA'],
				NODE_VERSION: process.env['NODE_VERSION'],
				PACKAGE_NAME: metadata.name,
				PACKAGE_VERSION: metadata.version,
			},
		}),
		...plugins,
		resolve({
			preferBuiltins: true,
		}),
		commonjs(),
		eslint({
			configFile: join('.', 'config', 'eslint.json'),
			exclude: [
				join('node_modules', '**'),
				join('src', 'resource'),
				join('src', '**', '*.json'),
				join('src', '**', '*.yml'),
			],
			include: [
				join('src', '**', '*.ts'),
				join('test', '**', '*.ts'),
			],
			throwOnError: true,
			useEslintrc: false,
		}),
		typescript({
			cacheRoot: join(targetPath, 'cache', 'rts2'),
			rollupCommonJSResolveHack: true,
		}),
		(flag_serve ? serve({
			host: '0.0.0.0',
			open: true,
			verbose: true,
			contentBase: [
				join(rootPath, 'out'),
				join(rootPath, 'resources'),
			],
			mimeTypes: {
				'application/javascript': ['mjs'],
			},
		}) : undefined),
	],
};

export default [
	bundle,
];
