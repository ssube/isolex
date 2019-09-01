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
	input: {
		include: [
			'src/index.ts',
			'test/harness.ts',
			'test/**/Test*.ts',
		],
		exclude: [
			'node_modules/mongodb',
			'node_modules/mysql',
			'node_modules/mysql2',
			'node_modules/oracledb',
		],
	},
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
		replace({
			delimiters: ['from \'', '\''],
			values: {
				'mongodb': 'empty-module',
				'mysql': 'empty-module',
				'mysql2': 'empty-module',
				'oracledb': 'empty-module',
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
