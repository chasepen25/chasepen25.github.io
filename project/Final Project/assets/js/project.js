(function () {
	// Find the parts of the page we want to change with JavaScript.
	var form = document.getElementById('feedback-form');
	var status = document.getElementById('form-status');
	var letterboxdLists = document.querySelector('[data-letterboxd-lists]');
	var letterboxdStatus = document.querySelector('[data-letterboxd-status]');
	var letterboxdGrid = document.querySelector('[data-letterboxd-grid]');
	var recentWatches = document.querySelector('[data-letterboxd-recent]');
	var recentWatchesStatus = document.querySelector('[data-letterboxd-recent-status]');
	var recentWatchesGrid = document.querySelector('[data-letterboxd-recent-grid]');

	function loadJson(source, onSuccess, onError) {
		fetch(source)
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Could not load the JSON file.');
				}

				return response.json();
			})
			.then(onSuccess)
			.catch(onError);
	}

	function formatRating(rating) {
		var numericRating = Number(rating);

		if (!numericRating) {
			return 'No star rating';
		}

		var fullStars = Math.floor(numericRating);
		var hasHalfStar = numericRating % 1 !== 0;
		var stars = '';
		var index;

		for (index = 0; index < fullStars; index += 1) {
			stars += '★';
		}

		if (hasHalfStar) {
			stars += '½';
		}

		return stars;
	}

	if (form && status) {
		form.addEventListener('submit', function (event) {
			// Stop the form from refreshing the page.
			event.preventDefault();

			// Show a simple success message.
			status.textContent = 'Thanks for the feedback. This form is part of my project testing page.';
		});

		form.addEventListener('reset', function () {
			window.setTimeout(function () {
				// Clear the message after the form is reset.
				status.textContent = '';
			}, 0);
		});
	}

	if (letterboxdLists && letterboxdStatus && letterboxdGrid) {
		loadJson(
			letterboxdLists.getAttribute('data-source'),
			function (data) {
				var lists = Array.isArray(data.lists) ? data.lists : [];

				if (!lists.length) {
					letterboxdStatus.textContent = 'No lists are loaded yet. Run the Python scraper to fill in the JSON file.';
					return;
				}

				letterboxdGrid.innerHTML = '';

				lists.forEach(function (list) {
					var card = document.createElement('article');
					var title = document.createElement('h3');
					var titleLink = document.createElement('a');
					var meta = document.createElement('p');
					var filmList = document.createElement('ol');

					card.className = 'letterboxd-card';
					meta.className = 'letterboxd-meta';
					filmList.className = 'letterboxd-film-list';

					titleLink.href = list.url;
					titleLink.textContent = list.title;
					title.appendChild(titleLink);

					meta.textContent = (list.filmCount || 0) + ' films';

					(list.films || []).forEach(function (film) {
						var item = document.createElement('li');
						item.textContent = film;
						filmList.appendChild(item);
					});

					card.appendChild(title);
					card.appendChild(meta);

					if (filmList.children.length) {
						card.appendChild(filmList);
					} else {
						var emptyMessage = document.createElement('p');
						emptyMessage.className = 'letterboxd-empty';
						emptyMessage.textContent = 'Run the scraper to load the film titles for this list.';
						card.appendChild(emptyMessage);
					}

					letterboxdGrid.appendChild(card);
				});

				letterboxdStatus.textContent = data.updatedAt
					? 'Last updated: ' + data.updatedAt
					: 'Letterboxd lists loaded from local JSON.';
				letterboxdGrid.hidden = false;
			},
			function () {
				letterboxdStatus.textContent = 'The list data could not be loaded. If you opened the site as a file, try serving the folder or using GitHub Pages.';
			}
		);
	}

	if (recentWatches && recentWatchesStatus && recentWatchesGrid) {
		loadJson(
			recentWatches.getAttribute('data-source'),
			function (data) {
				var watches = Array.isArray(data.watches) ? data.watches : [];

				if (!watches.length) {
					recentWatchesStatus.textContent = 'No recent watches are loaded yet. Run the RSS Python script to fill in the JSON file.';
					return;
				}

				recentWatchesGrid.innerHTML = '';

				watches.forEach(function (watch) {
					var card = document.createElement('article');
					var posterLink = document.createElement('a');
					var poster = document.createElement('img');
					var content = document.createElement('div');
					var heading = document.createElement('h3');
					var headingLink = document.createElement('a');
					var meta = document.createElement('p');
					var excerpt = document.createElement('p');
					var action = document.createElement('p');
					var actionLink = document.createElement('a');
					var detailParts = [];

					card.className = 'recent-watch-card';
					content.className = 'recent-watch-content';
					meta.className = 'recent-watch-meta';
					excerpt.className = 'recent-watch-excerpt';
					action.className = 'recent-watch-action';

					if (watch.watchedDate) {
						detailParts.push('Watched ' + watch.watchedDate);
					}

					if (watch.rating) {
						detailParts.push('Rating ' + formatRating(watch.rating));
					}

					if (watch.rewatch) {
						detailParts.push('Rewatch');
					}

					if (watch.posterUrl) {
						posterLink.href = watch.url;
						posterLink.className = 'recent-watch-poster';
						poster.src = watch.posterUrl;
						poster.alt = watch.title + ' poster';
						poster.loading = 'lazy';
						posterLink.appendChild(poster);
						card.appendChild(posterLink);
					}

					headingLink.href = watch.url;
					headingLink.textContent = watch.year
						? watch.title + ' (' + watch.year + ')'
						: watch.title;
					heading.appendChild(headingLink);

					meta.textContent = detailParts.join(' • ') || 'Recent watch from Letterboxd';

					excerpt.textContent = watch.excerpt || 'No review text was included for this watch.';

					actionLink.href = watch.url;
					actionLink.textContent = 'View on Letterboxd';
					action.appendChild(actionLink);

					content.appendChild(heading);
					content.appendChild(meta);
					content.appendChild(excerpt);
					content.appendChild(action);
					card.appendChild(content);
					recentWatchesGrid.appendChild(card);
				});

				recentWatchesStatus.textContent = data.updatedAt
					? 'Last updated: ' + data.updatedAt
					: 'Recent watches loaded from local JSON.';
				recentWatchesGrid.hidden = false;
			},
			function () {
				recentWatchesStatus.textContent = 'The recent watch data could not be loaded. If you opened the site as a file, try serving the folder or using GitHub Pages.';
			}
		);
	}
})();
