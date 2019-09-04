import commonjs from 'rollup-plugin-commonjs';
import externals from 'rollup-plugin-node-externals'
import json from 'rollup-plugin-json';
import multiEntry from 'rollup-plugin-multi-entry';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const debug = process.env['DEBUG'] === 'TRUE';
const passStub = 'require("pass-stub")'
const metadata = require('../package.json');

const bundle = {
	external: [
		'async_hooks',
	],
	input: {
		include: [
			'src/index.ts',
			'test/harness.ts',
			'test/**/Test*.ts',
		],
	},
	manualChunks(id) {
		if (id.includes('/test/')) { // || id.includes('/chai/') || id.includes('/mocha/') || id.includes('/sinon/')) {
			return 'test';
		}

		if (id.includes('/node_modules/')) {
			return 'vendor';
		}

		if (id.match(/commonjs/i) || id.match(/rollup/i) || id.includes('noicejs') || id.includes('pass-stub')) {
			if (debug) {
				console.log('==vendor', id);
			}

			return 'vendor';
		}

		if (id.includes('/src/')) {
			if (debug) {
				console.log('==main', id);
			}

			return 'main';
		}

		if (debug) {
			console.log('==index', id);
		}

		return 'index';
	},
	output: {
		dir: 'out/',
		chunkFileNames: '[name].js',
		entryFileNames: 'entry-[name].js',
		format: 'cjs',
		globals: {

		},
		sourcemap: true,
		banner: () => {
			return '\n';
		},
	},
	plugins: [
		multiEntry(),
		json(),
		externals({
			builtins: true,
			deps: true,
			devDeps: false,
			peerDeps: false,
		}),
		replace({
			delimiters: ['require("', '")'],
			values: {
				'ioredis': passStub,
				'mongodb': passStub,
				'mssql': passStub,
				'mysql': passStub,
				'mysql2': passStub,
				'oracledb': passStub,
				'pg': passStub,
				'pg-native': passStub,
				'pg-query-stream': passStub,
				'react-native-sqlite-storage': passStub,
				'redis': passStub,
				'sql.js': passStub,
			},
		}),
		replace({
			delimiters: ['require(\'', '\')'],
			values: {
				'@discordjs/uws': passStub,
				'erlpack': passStub,
				'ffmpeg-binaries': passStub,
				'node-opus': passStub,
				'opusscript': passStub,
			},
		}),
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
				'node_modules/cron/lib/cron.js': [
					'CronJob',
				],
				'node_modules/lodash/lodash.js': [
					'flatten',
					'get',
					'isBoolean',
					'isEmpty',
					'isFunction',
					'isMap',
					'isNil',
					'isNumber',
					'isObject',
					'isString',
					'kebabCase',
					'trim',
				],
				'node_modules/mathjs/index.js': [
					'max',
					'min',
					'random',
					'randomInt',
				],
				'node_modules/express/index.js': [
					'json',
					'Request',
					'Response',
					'Router',
				],
				'node_modules/typeorm/index.js': [
					'AfterLoad',
					'BeforeInsert',
					'BeforeUpdate',
					'CreateDateColumn',
					'Column',
					'Entity',
					'EntityRepository',
					'Equal',
					'FindManyOptions',
					'In',
					'JoinColumn',
					'LessThan',
					'ManyToOne',
					'OneToOne',
					'PrimaryColumn',
					'PrimaryGeneratedColumn',
					'Table',
					'TableColumn',
					'UpdateDateColumn',
				],
				/*
				'': [
					'GraphQLID',
					'GraphQLInputObjectType',
					'GraphQLList',
					'GraphQLObjectType',
					'GraphQLString',
				],
				*/
				'node_modules/js-yaml/index.js': [
					'DEFAULT_SAFE_SCHEMA',
					'safeLoad',
					'Schema',
					'Type',
				],
				'node_modules/@slack/client/dist/index.js': [
					'WebAPICallResult',
					'WebClient',
				],
				'node_modules/node-emoji/index.js': [
					'find',
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
