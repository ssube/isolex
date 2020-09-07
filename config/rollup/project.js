const { join } = require('path');
const replace = require('@rollup/plugin-replace');

const metadata = require('../../package.json');

module.exports = {
	plugins: [
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
			delimiters: ['', ''],
			values: {
				/* unnecessary drivers loaded by TypeORM */
				"require('@sap/hdbext')": 'undefined',
				"require('ioredis')": 'undefined',
				"require('mongodb')": 'undefined',
				"require('mssql')": 'undefined',
				"require('mysql')": 'undefined',
				"require('mysql2')": 'undefined',
				"require('oracledb')": 'undefined',
				"require('pg')": 'undefined',
				"require('pg-native')": 'undefined',
				"require('pg-query-stream')": 'undefined',
				"require('react-native-sqlite-storage')": 'undefined',
				"require('redis')": 'undefined',
				"require('sql.js')": 'undefined',
				"require('typeorm-aurora-data-api-driver')": 'undefined',
				/* other packages that need to be removed */
				"require('@discordjs/uws')": 'undefined',
				"require('electron')": 'undefined',
				"require('erlpack')": 'undefined',
				"require('ffmpeg-binaries')": 'undefined',
				"require('node-opus')": 'undefined',
				"require('opusscript')": 'undefined',
			},
		}),
	],
};
