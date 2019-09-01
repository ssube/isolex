import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import multiEntry from 'rollup-plugin-multi-entry';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import hypothetical from 'rollup-plugin-hypothetical';

const emptyModule = `
          export default {};
        `
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
		if (id.includes('/test/') || id.includes('/chai/')) {
			return 'test';
		}

		if (id.includes('/src/')) {
			return 'main';
		}

		if (id.includes('/node_modules/')) {
			return 'vendor';
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
		hypothetical({
			allowFallthrough: true,
			files: {
				'mongodb/': emptyModule,
				'mysql/': emptyModule,
				'mysql2/': emptyModule,
				'mssql': emptyModule,
				'oracledb': emptyModule,
			},
			leaveIdsAlone: true,
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
