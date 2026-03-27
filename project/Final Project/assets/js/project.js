(function () {
	var feedUrl = 'https://letterboxd.com/ACE_AS_CHASE/list/oscar-2025/rss/';
	var listUrl = 'https://letterboxd.com/ACE_AS_CHASE/list/oscar-2025/';
	var proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(feedUrl);

	function stripHtml(value) {
		var temp = document.createElement('div');
		temp.innerHTML = value || '';
		return temp.textContent || temp.innerText || '';
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function truncate(text, maxLength, fallback) {
		if (!text) {
			return fallback;
		}

		return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
	}

	function initLetterboxdEmbed() {
		var embed = document.getElementById('letterboxd-embed-wrapper-tc');

		if (!embed) {
			return;
		}

		fetch('https://lb-embed-content.bokonon.dev?username=ace_as_chase')
			.then(function (response) {
				return response.text();
			})
			.then(function (data) {
				embed.innerHTML = data;
			})
			.catch(function () {
				embed.textContent = 'Could not load Letterboxd right now.';
			});
	}

	function createHomepageCard(item) {
		var itemLink = item.querySelector('link') ? item.querySelector('link').textContent.trim() : listUrl;
		var titleText = stripHtml(item.querySelector('title') && item.querySelector('title').textContent) || 'Letterboxd entry';
		var summaryText = truncate(
			stripHtml(item.querySelector('description') && item.querySelector('description').textContent),
			190,
			'A film pulled from my live Oscar 2025 Letterboxd list.'
		);
		var article = document.createElement('article');

		article.innerHTML =
			'<header>' +
				'<span class="date">From my Oscar 2025 list</span>' +
				'<h2><a href="' + itemLink + '"></a></h2>' +
			'</header>' +
			'<a href="' + itemLink + '" class="image fit"><img src="images/pic05.jpg" alt=""></a>' +
			'<p></p>' +
			'<ul class="actions special"><li><a href="' + itemLink + '" class="button">View on Letterboxd</a></li></ul>';

		article.querySelector('h2 a').textContent = titleText;
		article.querySelector('img').alt = titleText + ' from my Oscar 2025 Letterboxd list.';
		article.querySelector('p').textContent = summaryText;

		return article;
	}

	function initHomepageList() {
		var container = document.getElementById('homepage-list-posts');

		if (!container) {
			return;
		}

		fetch(proxyUrl)
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Feed request failed');
				}

				return response.text();
			})
			.then(function (xmlText) {
				var parser = new DOMParser();
				var xml = parser.parseFromString(xmlText.trim(), 'text/xml');
				var items = Array.prototype.slice.call(xml.querySelectorAll('item')).slice(0, 3);

				if (!items.length) {
					throw new Error('No items found');
				}

				container.innerHTML = '';
				items.forEach(function (item) {
					container.appendChild(createHomepageCard(item));
				});
			})
			.catch(function () {
				container.innerHTML =
					'<article>' +
						'<header><span class="date">List unavailable</span><h2><a href="' + listUrl + '">Oscar 2025 list</a></h2></header>' +
						'<a href="' + listUrl + '" class="image fit"><img src="images/pic05.jpg" alt="Oscar 2025 list fallback card."></a>' +
						'<p>The live cards could not load right now, but the full list is still available on Letterboxd.</p>' +
						'<ul class="actions special"><li><a href="' + listUrl + '" class="button">Open the list</a></li></ul>' +
					'</article>';
			});
	}

	function createRssCard(item) {
		var article = document.createElement('article');
		var title = document.createElement('h3');
		var link = item.querySelector('link') ? item.querySelector('link').textContent.trim() : feedUrl;
		var anchor = document.createElement('a');
		var description = stripHtml(item.querySelector('description') && item.querySelector('description').textContent);

		article.className = 'rss-card';
		title.textContent = stripHtml(item.querySelector('title') && item.querySelector('title').textContent);
		anchor.href = link;
		anchor.className = 'button small';
		anchor.textContent = 'Open on Letterboxd';

		article.appendChild(title);
		article.appendChild(anchor);

		if (description) {
			var summary = document.createElement('p');
			summary.textContent = truncate(description, 180, '');
			article.appendChild(summary);
		}

		return article;
	}

	function initFavoritesFeed() {
		var container = document.getElementById('rss-list');
		var status = document.getElementById('rss-list-status');

		if (!container || !status) {
			return;
		}

		fetch(proxyUrl)
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Feed request failed');
				}

				return response.text();
			})
			.then(function (xmlText) {
				var parser = new DOMParser();
				var xml = parser.parseFromString(xmlText.trim(), 'text/xml');
				var items = Array.prototype.slice.call(xml.querySelectorAll('item')).slice(0, 6);

				if (!items.length) {
					throw new Error('No items found');
				}

				status.textContent = 'Latest entries from my Oscar 2025 list:';
				items.forEach(function (item) {
					container.appendChild(createRssCard(item));
				});
			})
			.catch(function () {
				status.innerHTML = 'The live RSS feed could not load right now. You can still view the list directly on <a href="' + listUrl + '">Letterboxd</a>.';
			});
	}

	function initMoviePicker() {
		var picker = document.querySelector('[data-movie-picker]');
		var result = document.getElementById('movie-picker-result');
		var buttons;
		var moods;

		if (!picker || !result) {
			return;
		}

		moods = {
			comfort: 'Comfort watch: I usually go with something rewatchable, funny, or emotionally easy to settle into.',
			intense: 'Something intense: this is where tense dramas, thrillers, or high-pressure movies jump to the top of my list.',
			visual: 'Pure visuals: I start leaning toward movies with standout cinematography, color, and style-first direction.',
			surprise: 'Surprise me: I would probably pick whatever has been sitting on my watchlist the longest and finally give it a shot.'
		};

		buttons = picker.querySelectorAll('[data-mood]');
		buttons.forEach(function (button) {
			button.addEventListener('click', function () {
				buttons.forEach(function (item) {
					item.classList.remove('primary');
				});

				button.classList.add('primary');
				result.textContent = moods[button.getAttribute('data-mood')] || moods.surprise;
			});
		});
	}

	function buildFeedbackPreview(data) {
		var selected = [];

		if (data.moreReviews) {
			selected.push('more full reviews');
		}

		if (data.betterNav) {
			selected.push('clearer navigation');
		}

		return '<h3>Latest testing note</h3>' +
			'<p><strong>Tester:</strong> ' + escapeHtml(data.name) + '</p>' +
			'<p><strong>Most useful section:</strong> ' + escapeHtml(data.favoriteSection) + '</p>' +
			'<p><strong>Clarity:</strong> ' + escapeHtml(data.clarity) + '</p>' +
			'<p><strong>Requested upgrades:</strong> ' + escapeHtml(selected.length ? selected.join(', ') : 'None selected') + '</p>' +
			'<p><strong>Comment:</strong> ' + escapeHtml(data.message) + '</p>';
	}

	function initFeedbackForm() {
		var form = document.getElementById('feedback-form');
		var status = document.getElementById('form-status');
		var preview = document.getElementById('feedback-preview');
		var storageKey = 'chase-movie-feedback';

		if (!form || !status || !preview) {
			return;
		}

		function renderSavedFeedback() {
			var saved = window.localStorage.getItem(storageKey);

			if (!saved) {
				preview.hidden = true;
				return;
			}

			preview.hidden = false;
			preview.innerHTML = buildFeedbackPreview(JSON.parse(saved));
		}

		form.addEventListener('submit', function (event) {
			var formData = new FormData(form);
			var feedback = {
				name: formData.get('visitor-name') || 'Anonymous tester',
				favoriteSection: formData.get('favorite-section') || 'No section selected',
				clarity: formData.get('clarity') || 'No answer',
				moreReviews: formData.get('more-reviews') === 'on',
				betterNav: formData.get('better-nav') === 'on',
				message: formData.get('visitor-message') || 'No written comment provided.'
			};

			event.preventDefault();
			window.localStorage.setItem(storageKey, JSON.stringify(feedback));
			status.textContent = 'Thanks. Your feedback was saved in this browser as a testing note for the project.';
			renderSavedFeedback();
		});

		form.addEventListener('reset', function () {
			window.setTimeout(function () {
				status.textContent = 'Form cleared. The last saved testing note stays visible below until a new one is submitted.';
			}, 0);
		});

		renderSavedFeedback();
	}

	initLetterboxdEmbed();
	initHomepageList();
	initFavoritesFeed();
	initMoviePicker();
	initFeedbackForm();
})();
