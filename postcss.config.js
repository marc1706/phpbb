module.exports = {
	plugins: [
		require('tailwindcss')('./tailwind.config.js'),
		require('autoprefixer')(),
		process.env.MINIFY === '1' ? require('cssnano')() : false,
	].filter(Boolean),
};
