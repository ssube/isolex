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
	],
};
