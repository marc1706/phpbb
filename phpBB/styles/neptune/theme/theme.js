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

	// 2. Generic dropdown controller
	// Registers a trigger/panel pair: toggling, click-outside dismissal, Escape to
	// close, and closing any sibling dropdown so only one panel is ever open.
	const dropdowns = [];

	function closeDropdown(entry, refocus = false) {
		entry.button.setAttribute('aria-expanded', 'false');
		entry.menu.classList.add('hidden');

		if (refocus) {
			entry.button.focus();
		}
	}

	function registerDropdown(buttonId, menuId, parentId) {
		const button = document.getElementById(buttonId);
		const menu = document.getElementById(menuId);
		const parent = document.getElementById(parentId);

		if (!button || !menu || !parent) {
			return;
		}

		const entry = { button, menu, parent };
		dropdowns.push(entry);

		button.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();

			const willOpen = menu.classList.contains('hidden');

			// Only one dropdown open at a time
			dropdowns.forEach(other => {
				if (other !== entry) {
					closeDropdown(other);
				}
			});

			button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
			menu.classList.toggle('hidden', !willOpen);
		});

		parent.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				closeDropdown(entry, true);
			}
		});
	}

	registerDropdown('quick-links-button', 'quick-links-menu', 'quick-links-parent');
	registerDropdown('user-menu-button', 'user-menu', 'user-menu-parent');
	registerDropdown('notification_list_button', 'notification_list', 'notification_dropdown_parent');

	// Single document listener dismisses whichever dropdown the click fell outside of
	document.addEventListener('click', (event) => {
		dropdowns.forEach(entry => {
			if (!entry.parent.contains(event.target)) {
				closeDropdown(entry);
			}
		});
	});

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
