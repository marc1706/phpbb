module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
		...(process.env.MINIFY === '1' ? { cssnano: {} } : {}),
	},
};
