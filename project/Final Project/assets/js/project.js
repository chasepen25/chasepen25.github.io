(function () {
	// Find the parts of the page we want to change with JavaScript.
	var form = document.getElementById('feedback-form');
	var status = document.getElementById('form-status');
	var letterboxdLists = document.querySelector('[data-letterboxd-lists]');
	var letterboxdStatus = document.querySelector('[data-letterboxd-status]');
	var letterboxdGrid = document.querySelector('[data-letterboxd-grid]');

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
		fetch(letterboxdLists.getAttribute('data-source'))
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Could not load the Letterboxd data file.');
				}

				return response.json();
			})
			.then(function (data) {
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
			})
			.catch(function () {
				letterboxdStatus.textContent = 'The list data could not be loaded. If you opened the site as a file, try serving the folder or using GitHub Pages.';
			});
	}
})();
