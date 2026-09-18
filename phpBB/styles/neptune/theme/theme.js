/**
 * phpBB prosilver Modern Theme JS
 * Pure vanilla ES6 JavaScript. Framework and library free.
 * Handles: Dark Theme Toggle, Menu Dropdowns, Accessible Keyboard navigations, Hamburger toggling.
 */

document.addEventListener('DOMContentLoaded', () => {

	// 1. Dark Mode Toggle Operations
	const themeToggleBtn = document.getElementById('theme-toggle');
	const lightIcon = document.getElementById('theme-toggle-light-icon');
	const darkIcon = document.getElementById('theme-toggle-dark-icon');

	function updateIcons() {
		const isDark = document.documentElement.classList.contains('dark');
		if (isDark) {
			lightIcon.classList.remove('hidden');
			darkIcon.classList.add('hidden');
		} else {
			lightIcon.classList.add('hidden');
			darkIcon.classList.remove('hidden');
		}
	}

	// Initial Sync
	updateIcons();

	if (themeToggleBtn) {
		themeToggleBtn.addEventListener('click', () => {
			const containsDark = document.documentElement.classList.toggle('dark');
			localStorage.setItem('prosilver-theme', containsDark ? 'dark' : 'light');
			updateIcons();
		});
	}

	// 2. Head User Dropdown Controller
	const userMenuBtn = document.getElementById('user-menu-button');
	const userMenu = document.getElementById('user-menu');
	const userMenuParent = document.getElementById('user-menu-parent');

	if (userMenuBtn && userMenu) {
		userMenuBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			const isExpanded = userMenuBtn.getAttribute('aria-expanded') === 'true';
			userMenuBtn.setAttribute('aria-expanded', !isExpanded);
			userMenu.classList.toggle('hidden');
		});

		// Close menu when clicking outside
		document.addEventListener('click', (event) => {
			if (!userMenuParent.contains(event.target)) {
				userMenuBtn.setAttribute('aria-expanded', 'false');
				userMenu.classList.add('hidden');
			}
		});

		// Keyboard support - Escape closes menu
		userMenuParent.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				userMenuBtn.setAttribute('aria-expanded', 'false');
				userMenu.classList.add('hidden');
				userMenuBtn.focus();
			}
		});
	}

	// 3. Notification Dropdown
	const notificationBtn = document.getElementById('notification_list_button');
	const notificationMenu = document.getElementById('notification_list');
	const notificationParent = document.getElementById('notification_dropdown_parent');

	if (notificationBtn && notificationMenu && notificationParent) {
		notificationBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			const isExpanded = notificationBtn.getAttribute('aria-expanded') === 'true';
			notificationBtn.setAttribute('aria-expanded', !isExpanded);
			notificationMenu.classList.toggle('hidden');
		});

		document.addEventListener('click', (event) => {
			if (!notificationParent.contains(event.target)) {
				notificationBtn.setAttribute('aria-expanded', 'false');
				notificationMenu.classList.add('hidden');
			}
		});

		notificationParent.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				notificationBtn.setAttribute('aria-expanded', 'false');
				notificationMenu.classList.add('hidden');
				notificationBtn.focus();
			}
		});
	}

	// 4. Mobile Hamburger Menu Toggler
	const mobileMenuBtn = document.getElementById('mobile-menu-button');
	const mobileMenu = document.getElementById('mobile-menu');
	const hamburgerIcon = document.getElementById('hamburger-icon');
	const closeIcon = document.getElementById('close-icon');

	if (mobileMenuBtn && mobileMenu) {
		mobileMenuBtn.addEventListener('click', () => {
			const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
			mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
			mobileMenu.classList.toggle('hidden');

			if (mobileMenu.classList.contains('hidden')) {
				hamburgerIcon.classList.remove('hidden');
				closeIcon.classList.add('hidden');
			} else {
				hamburgerIcon.classList.add('hidden');
				closeIcon.classList.remove('hidden');
			}
		});
	}

	// 5. phpBB Accessibility Helper - Keyboard Tab Traps and focus landmarks
	const focusables = document.querySelectorAll('a[href], button, input, textarea, select');
	focusables.forEach(elem => {
		elem.addEventListener('focus', () => {
			elem.classList.add('ring-2', 'ring-prosilver-500', 'ring-offset-2', 'dark:ring-offset-slate-900', 'outline-none');
		});
		elem.addEventListener('blur', () => {
			elem.classList.remove('ring-2', 'ring-prosilver-500', 'ring-offset-2', 'dark:ring-offset-slate-900', 'outline-none');
		});
	});

});
