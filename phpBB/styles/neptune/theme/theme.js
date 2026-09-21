/**
 * phpBB prosilver Modern Theme JS
 * Pure vanilla ES6 JavaScript. Framework and library free.
 * Handles: Dark Theme Toggle, Menu Dropdowns, Accessible Keyboard navigations, Hamburger toggling,
 * web push subscribing, and the minimal phpbb helpers required by core scripts.
 */

/**
 * Minimal phpbb global.
 *
 * Core scripts loaded via INCLUDEJS -- webpush.js in particular -- expect a global
 * `phpbb` object offering alert(), loadingIndicator() and alertTime. prosilver gets
 * those from assets/javascript/core.js, which requires jQuery. This style is library
 * free, so only the handful of helpers that are actually needed are implemented
 * natively here. Each one is defined only if it does not exist yet, so additionally
 * loading core.js keeps working.
 */
(() => {
	window.phpbb = window.phpbb || {};

	if (typeof phpbb.alertTime !== 'number') {
		phpbb.alertTime = 100;
	}

	/**
	 * Fade an element out and remove it from the DOM.
	 *
	 * @param {HTMLElement} element Element to fade out
	 * @param {number} duration Fade duration in milliseconds
	 */
	function fadeOutAndRemove(element, duration) {
		if (!element || !element.parentNode) {
			return;
		}

		element.style.transition = 'opacity ' + duration + 'ms ease-in-out';
		element.style.opacity = '0';
		setTimeout(() => element.remove(), duration);
	}

	if (typeof phpbb.alert !== 'function') {
		/**
		 * Display a modal alert box.
		 *
		 * @param {string} title Title of the alert
		 * @param {string} message Message of the alert
		 * @returns {HTMLElement} Alert element
		 */
		phpbb.alert = (title, message) => {
			const overlay = document.createElement('div');
			overlay.className = 'phpbb-alert fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 px-4';
			overlay.setAttribute('role', 'alertdialog');
			overlay.setAttribute('aria-modal', 'true');

			const box = document.createElement('div');
			box.className = 'w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-slate-800 dark:text-slate-100';
			box.tabIndex = -1;

			const heading = document.createElement('h3');
			heading.className = 'text-sm font-bold mb-2';
			heading.textContent = title;

			const text = document.createElement('p');
			text.className = 'text-xs leading-relaxed text-slate-600 dark:text-slate-300';
			text.textContent = message;

			box.append(heading, text);
			overlay.append(box);
			document.body.append(overlay);

			const keyHandler = (event) => {
				if (event.key === 'Escape') {
					closeAlert();
				}
			};

			function closeAlert() {
				document.removeEventListener('keydown', keyHandler);
				fadeOutAndRemove(overlay, phpbb.alertTime);
			}

			overlay.addEventListener('click', closeAlert);
			document.addEventListener('keydown', keyHandler);
			box.focus();

			return overlay;
		};
	}

	if (typeof phpbb.loadingIndicator !== 'function') {
		/**
		 * Show the loading indicator.
		 *
		 * @returns {{fadeOut: function(number): void}} Handle offering a jQuery compatible fadeOut()
		 */
		phpbb.loadingIndicator = () => {
			let indicator = document.getElementById('loading_indicator');

			if (!indicator) {
				indicator = document.createElement('div');
				indicator.id = 'loading_indicator';
				indicator.className = 'fixed inset-0 z-100 flex items-center justify-center bg-slate-900/30';
				indicator.innerHTML = '<span class="h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>';
				document.body.append(indicator);
			}

			return {
				fadeOut: (duration) => fadeOutAndRemove(indicator, duration || phpbb.alertTime),
			};
		};
	}
})();

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

	function bindDropdown(button, menu, parent) {
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

	function registerDropdown(buttonId, menuId, parentId) {
		const button = document.getElementById(buttonId);
		const menu = document.getElementById(menuId);
		const parent = document.getElementById(parentId);

		if (button && menu && parent) {
			bindDropdown(button, menu, parent);
		}
	}

	registerDropdown('quick-links-button', 'quick-links-menu', 'quick-links-parent');
	registerDropdown('user-menu-button', 'user-menu', 'user-menu-parent');
	registerDropdown('notification-button', 'notification-menu', 'notification-dropdown-parent');

	// Declarative registration, so a template can add a dropdown without editing this file:
	// mark the wrapper with data-dropdown and its two parts with data-dropdown-button
	// and data-dropdown-menu. Everything else (click-outside, Escape, one-open-at-a-time)
	// is shared with the dropdowns registered by id above.
	document.querySelectorAll('[data-dropdown]').forEach((parent) => {
		const button = parent.querySelector('[data-dropdown-button]');
		const menu = parent.querySelector('[data-dropdown-menu]');

		if (button && menu) {
			bindDropdown(button, menu, parent);
		}
	});

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

	// 5. Web push subscribe bar in the notifications dropdown
	// webpush.js only toggles the `hidden` class on the subscribe/unsubscribe buttons.
	// The dropdown should merely offer subscribing, so the entire bar is hidden as soon
	// as the subscribe button is, i.e. once the user is subscribed. Unsubscribing stays
	// available in the UCP notification settings.
	const webpushBar = document.querySelector('.webpush-subscribe');
	const subscribeButton = document.getElementById('subscribe_webpush');

	if (webpushBar && subscribeButton) {
		const syncWebpushBar = () => {
			webpushBar.classList.toggle('hidden', subscribeButton.classList.contains('hidden'));
		};

		new MutationObserver(syncWebpushBar).observe(subscribeButton, {
			attributes: true,
			attributeFilter: ['class'],
		});

		syncWebpushBar();
	}

	// 6. phpBB Accessibility Helper - Keyboard Tab Traps and focus landmarks
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
