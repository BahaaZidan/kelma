// embed-comment.js

(function () {
	/**
	 * Utility to safely encode URL query parameters
	 */
	function encodeParam(param) {
		return encodeURIComponent(param || '');
	}

	/**
	 * Get the canonical URL of the page
	 */
	// function getCanonicalURL() {
	// 	const link = document.querySelector('link[rel="canonical"]');
	// 	return link ? link.href : window.location.href;
	// }

	let iframe = null; // reference to the injected iframe

	/**
	 * @typedef {Object} Options
	 * @property {string|HTMLElement} container - DOM container element reference or its id.
	 * @property {string} website_id - Website ID you copied from console.
	 * @property {string} page_id - A string that uniquely identifies your page.
	 * @property {string|null} language - The locale
	 * @property {string|null} theme - A valid theme name. We support all DaisyUI themes.
	 */

	/**
	 * Initializes the widget with the provided options.
	 *
	 * @param {Options} options - Configuration options for the widget.
	 */
	window.embedCommentIframe = function ({
		container,
		website_id,
		page_id,
		language = 'en',
		theme = 'business',
	}) {
		const el = typeof container === 'string' ? document.getElementById(container) : container;

		if (!el) {
			// eslint-disable-next-line no-console
			console.error('Container not found for embedding comments');
			return;
		}

		const pageTitle = document.title;
		// const canonicalURL = getCanonicalURL();

		iframe = document.createElement('iframe');
		iframe.src = `http://localhost:5173/${language}/embeds/${website_id}/${page_id}/comments?name=${encodeParam(pageTitle)}&url=${encodeParam(window.location.href)}&theme=${theme}`;
		iframe.width = '100%';
		iframe.style.border = 'none';
		iframe.style.display = 'block';
		iframe.loading = 'lazy';
		iframe.setAttribute('scrolling', 'no');

		el.innerHTML = ''; // Clear existing content
		el.appendChild(iframe);
	};

	// Listen for resize messages from the iframe
	window.addEventListener('message', function (event) {
		if (!iframe) return;
		if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
			iframe.style.height = event.data.height + 'px';
		}
	});
})();
