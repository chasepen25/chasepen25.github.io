(function () {
	// Find the parts of the page we want to change with JavaScript.
	var picker = document.querySelector('[data-movie-picker]');
	var result = document.getElementById('movie-picker-result');
	var form = document.getElementById('feedback-form');
	var status = document.getElementById('form-status');

	if (picker && result) {
		// Grab all of the mood buttons and store the message for each one.
		var buttons = picker.querySelectorAll('[data-mood]');
		var moods = {
			comfort: 'Comfort watch: I would probably choose something fun, familiar, and easy to rewatch.',
			intense: 'Something intense: I would choose a movie with strong tension and serious performances.',
			visual: 'Pure visuals: I would choose a movie with great cinematography, color, and style.',
			surprise: 'Surprise me: I would choose something from my watchlist that feels different from what I usually pick.'
		};

		buttons.forEach(function (button) {
			button.addEventListener('click', function () {
				// Remove the highlight from every button first.
				buttons.forEach(function (item) {
					item.classList.remove('primary');
				});

				// Highlight the button that was clicked.
				button.classList.add('primary');

				// Change the text based on the button's data-mood value.
				result.textContent = moods[button.getAttribute('data-mood')];
			});
		});
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
})();
