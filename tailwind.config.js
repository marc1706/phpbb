/** @type {import('tailwindcss').Config} */
export default {
	darkMode: [ 'class' ],
	content: [ './phpBB/styles/chameleon/**/*.{html,js,html.twig}' ],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border, 218 20% 88%) / <alpha-value>)',
				input: 'hsl(var(--input, 218 20% 88%) / <alpha-value>)',
				ring: 'hsl(var(--ring, 198 100% 38%) / <alpha-value>)',
				background: 'hsl(var(--background, 0 0% 98%) / <alpha-value>)',
				foreground: 'hsl(var(--foreground, 219 20% 20%) / <alpha-value>)',
				'forum-footer': {
					DEFAULT: 'hsl(var(--forum-footer, 219 20% 20%) / <alpha-value>)',
					foreground: 'hsl(var(--forum-header-foreground, 0 0% 98%) / <alpha-value>)',
				},
				'forum-header': {
					DEFAULT: 'hsl(var(--forum-header, 219 20% 20%) / <alpha-value>)',
					foreground: 'hsl(var(--forum-header-foreground, 0 0% 98%) / <alpha-value>)',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary, 203 100% 26%) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground, 0 0% 100%) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary, 218 20% 95%) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground, 219 20% 20%) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive, 0 84% 60%) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground, 0 0% 100%) / <alpha-value>)',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted, 218 20% 95%) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground, 218 20% 60%) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent, 38 92% 50%) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground, 0 0% 100%) / <alpha-value>)',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover, 0 0% 100%) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground, 219 20% 20%) / <alpha-value>)',
				},
				card: {
					DEFAULT: 'hsl(var(--card, 0 0% 100%) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground, 219 20% 20%) / <alpha-value>)',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background, 0 0% 98%) / <alpha-value>)',
					foreground: 'hsl(var(--sidebar-foreground, 240 5.3% 26.1%) / <alpha-value>)',
					primary: 'hsl(var(--sidebar-primary, 240 5.9% 10%) / <alpha-value>)',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground, 0 0% 98%) / <alpha-value>)',
					accent: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%) / <alpha-value>)',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground, 240 5.9% 10%) / <alpha-value>)',
					border: 'hsl(var(--sidebar-border, 220 13% 91%) / <alpha-value>)',
					ring: 'hsl(var(--sidebar-ring, 217.2 91.2% 59.8%) / <alpha-value>)',
				},
				cosmic: {
					DEFAULT: 'hsl(198, 100%, 44%)',
					50: 'hsl(199, 100%, 80%)',
					100: 'hsl(198, 100%, 76%)',
					200: 'hsl(198, 100%, 68%)',
					300: 'hsl(198, 100%, 60%)',
					400: 'hsl(198, 100%, 52%)',
					500: 'hsl(198, 100%, 44%)',
					600: 'hsl(198, 100%, 33%)',
					700: 'hsl(198, 100%, 22%)',
					800: 'hsl(199, 100%, 11%)',
					900: 'hsl(0, 0%, 0%)',
					950: 'hsl(0, 0%, 0%)',
				},
				odyssey: 'hsl(218, 20%, 39%)',
				cosmos: 'hsl(219, 20%, 20%)',
				states: {
					danger: 'hsl(var(--danger, 1 61% 66%) / <alpha-value>)',
					info: 'hsl(var(--info, 200 66% 56%) / <alpha-value>)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
		},
	},
	plugins: [],
};
