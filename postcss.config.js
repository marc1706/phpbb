const sorting = require('postcss-sorting');
const sortOrder = require('./.postcss-sorting.json');

module.exports = {
	plugins: [
		require('tailwindcss')('./tailwind.config.js'),
		require('autoprefixer')(),
		sorting(sortOrder),
		process.env.MINIFY === '1' ? require('cssnano')() : false,
	].filter(Boolean),
};
