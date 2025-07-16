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
	 * Main function to embed the iframe into a given container
	 * @param {string | HTMLElement} container - ID of a div or the actual div element
	 * @param {string} website_id - The ID of the website that you copies from your console
	 * @param {string} page_id - The ID of the page
	 */
	window.embedCommentIframe = function (container, website_id, page_id) {
		const el = typeof container === 'string' ? document.getElementById(container) : container;

		if (!el) {
			// eslint-disable-next-line no-console
			console.error('Container not found for embedding comments');
			return;
		}

		const pageTitle = document.title;
		// const canonicalURL = getCanonicalURL();

		iframe = document.createElement('iframe');
		iframe.src = `http://localhost:5173/embeds/${website_id}/${page_id}/comments?name=${encodeParam(pageTitle)}&url=${encodeParam(window.location.href)}`;
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
