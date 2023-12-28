/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [ './phpBB/styles/chameleon/**/*.{html,js}' ],
	theme: {
		extend: {
			colors: {
				white: '#ffffff',
				cosmic: {
					DEFAULT: '#009BDF',
					50: '#98DFFF',
					100: '#83D9FF',
					200: '#5ACDFF',
					300: '#32C0FF',
					400: '#09B4FF',
					500: '#009BDF',
					600: '#0074A7',
					700: '#004D6F',
					800: '#002637',
					900: '#000000',
					950: '#000000'
				},
				odyssey: '#505f79',
				cosmos: '#29303d',
			},
		},
	},
	plugins: [],
};
