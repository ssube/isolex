import { join, sep } from 'path';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import json from 'rollup-plugin-json';
import multiEntry from 'rollup-plugin-multi-entry';
import externals from 'rollup-plugin-node-externals';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import yaml from 'rollup-plugin-yaml';

const external = require('./rollup-external.json').names;
const globals = require('./rollup-globals.json');
const metadata = require('../package.json');
const namedExports = require('./rollup-named.json');
const stubNames = require('./rollup-stub.json').names;

const passStub = 'undefined';
const stubs = stubNames.reduce((p, c) => (p[c] = passStub, p), {});

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
	manualChunks(id) {
		if (id.match(/commonjs-external/i) || id.match(/commonjsHelpers/)) {
			return 'vendor';
		}

		if (id.includes(`${sep}node_modules${sep}`) || id.includes(`${sep}noicejs${sep}`)) {
			return 'vendor';
		}

		if (id.includes(`${sep}test${sep}`)) {
			return 'test';
		}

		if (id.includes(`${sep}src${sep}index`)) {
			return 'index';
		}

		if (id.includes(`${sep}src${sep}`)) {
			return 'main';
		}

		return 'nochunk';
	},
	output: {
		dir: targetPath,
		chunkFileNames: '[name].js',
		entryFileNames: 'entry-[name].js',
		format: 'cjs',
		globals,
		sourcemap: true,
	},
	plugins: [
		multiEntry(),
		json(),
		yaml(),
		externals({
			builtins: true,
			deps: true,
			devDeps: false,
			peerDeps: false,
		}),
		replace({
			include: join('node_modules', 'universal-user-agent', '**'),
			values: {
				navigator: `{userAgent: "${metadata.name}"}`,
			},
		}),
		replace({
			delimiters: ['', ''],
			include: join('node_modules', 'openid-client', '**'),
			values: {
				'Issuer.useGot()': '/* do not use got */',
			},
		}),
		replace({
			delimiters: ['require("', '")'],
			values: stubs,
		}),
		replace({
			delimiters: ['require(\'', '\')'],
			values: stubs,
		}),
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
		resolve({
			preferBuiltins: true,
		}),
		commonjs({
			namedExports,
		}),
		eslint({
			configFile: join('.', 'config', 'eslint.json'),
			exclude: [
				join('node_modules', '**'),
				join('src', 'resource'),
				join('src', '**', '*.json'),
				join('src', '**', '*.yml'),
			],
			include: [
				join('**', '*.ts'),
			],
			throwOnError: true,
		}),
		typescript({
			cacheRoot: join(targetPath, 'cache', 'rts2'),
			rollupCommonJSResolveHack: true,
		}),
	],
};

export default [
	bundle,
];
