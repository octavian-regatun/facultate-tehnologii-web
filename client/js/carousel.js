import savePhoto from "./savePhoto.js";

document.addEventListener('photosLoaded', () => {
	let cards = document.querySelectorAll('.container-grid .card');
	const modal = document.querySelector('dialog');

	if (!modal) {
		console.error('Modal not found');
		return;
	}

	// When a new photo is added, the AJAX will add eventListeners on every card
	// But on the old photos, there are already event listeners
	// Therefore, they will trigger twice. Work-around to remove this "bug"
	// JS does not provide a way to add an event lister if there isn't already one
	// ......
	const removeAllEventListeners = (cards) => {
		cards.forEach(card => {
			const newCard = card.cloneNode(true);
			card.parentNode.replaceChild(newCard, card);
		});
	};

	removeAllEventListeners(cards);
	cards = document.querySelectorAll('.container-grid .card');
	// ^^^^^^

	let modalClose, modalCards, editButton, image, opacitySlider, hueSlider, saturationSlider, lightnessSlider, resetButton, saveButton;
	let currentIndex = 0;

	// Initialize (needed if the modal is closed and reopened)
	const initializeModalElements = () => {
		modalCards = modal.querySelectorAll('.card');
		if (modalCards.length === 0) {
			return false;
		}
		modalClose = modalCards[currentIndex].querySelector('.modal-close');
		modalCards.forEach(card => {
			card.style.display = 'none';
			card.style.transform = 'translateX(0%) rotateZ(0deg) scale(1)';
			card.style.filter = 'blur(0px)';
			card.style.zIndex = '1';
			card.style.pointerEvents = 'auto';
		});
		return true;
	};

	if (!initializeModalElements()) {
		return;
	}

	const modalPreviousButton = document.querySelector('.modal-previous-button');
	const modalNextButton = document.querySelector('.modal-next-button');

	if (!modalPreviousButton || !modalNextButton) {
		console.error('Modal navigation buttons not found');
		return;
	}

	let clickedCard;

	// Close modal
	modal.addEventListener('click', (event) => {
		let isCard = false;
		modalCards.forEach((card) => {
			if (card.contains(event.target)) {
				isCard = true;
			}
		});

		const isButton = event.target === modalPreviousButton ||
			event.target === modalNextButton ||
			event.target.parentElement === modalPreviousButton ||
			event.target.parentElement === modalNextButton;

		// close
		if ((!isCard && !isButton) || (modalClose && modalClose.contains(event.target))) {
			opacitySlider.value = 100;
			hueSlider.value = 0;
			saturationSlider.value = 100;
			lightnessSlider.value = 100;
			updateFilters();
			modal.close();
			event.stopPropagation();
		}

		// sliders
		if (editButton && editButton.contains(event.target)) {
			handleSliders();
		}

		// reset filters btn
		if (resetButton && resetButton.contains(event.target)) {
			opacitySlider.value = 100;
			hueSlider.value = 0;
			saturationSlider.value = 100;
			lightnessSlider.value = 100;
			updateFilters();
		}

		// save photo btn
		if (saveButton && saveButton.contains(event.target)) {
			const opacity = opacitySlider.value / 100;
			const hue = hueSlider.value;
			const saturation = saturationSlider.value + '%';
			const lightness = lightnessSlider.value + '%';
			const filters = `opacity(${opacity}) hue-rotate(${hue}deg) saturate(${saturation}) brightness(${lightness})`;
			savePhoto(image, filters);
			modal.close();
		}
	});

	modal.addEventListener('input', (event) => {
		updateFilters();
	});

	const updateFilters = () => {
		const opacity = opacitySlider.value / 100;
		const hue = hueSlider.value;
		const saturation = saturationSlider.value + '%';
		const lightness = lightnessSlider.value + '%';

		image.style.filter = `opacity(${opacity}) hue-rotate(${hue}deg) saturate(${saturation}) brightness(${lightness})`;
	};

	// Control + click
	const handleCtrlClick = (e) => {
		const clickedCard = e.target.closest('.card');
		const hasCheckmark = !!clickedCard.querySelector('.card-checkmark');

		if (hasCheckmark) {
			clickedCard.querySelector('.card-checkmark').remove();
		} else {
			const checkmark = document.createElement('img');
			checkmark.src = '../svgs/checkmark.svg';
			checkmark.className = 'card-checkmark';
			clickedCard.prepend(checkmark);
		}

		const collageButtonContainer = document.querySelector('.collage-btn-container');
		if (document.querySelectorAll('.card-checkmark').length >= 1) {
			collageButtonContainer.style.display = 'flex';
		} else {
			collageButtonContainer.style.display = 'none';
		}
	};

	// Modal opens up settings
	const updateModal = (e) => {
		if (!initializeModalElements())
			return;

		// Special case: 1 card
		if (modalCards.length === 1) {
			modalCards[0].style.display = 'flex';
			editButton = modalCards[0].querySelector('.card-content-edit-button');
			resetButton = modalCards[0].querySelector('.card-content-edit-reset-button');
			saveButton = modalCards[0].querySelector('.card-content-edit-save-button');
			image = modalCards[0].querySelector('img');
			const inputs = modalCards[0].querySelectorAll('input');

			opacitySlider = inputs[0];
			hueSlider = inputs[1];
			saturationSlider = inputs[2];
			lightnessSlider = inputs[3];
			modalPreviousButton.style.display = 'none';
			modalNextButton.style.display = 'none';
			modal.showModal();
			return;
		}


		clickedCard = e.target.closest('.card');
		const siblings = Array.from(clickedCard.parentElement.children);
		const index = siblings.indexOf(clickedCard);
		currentIndex = index;

		editButton = modalCards[currentIndex].querySelector('.card-content-edit-button');
		resetButton = modalCards[currentIndex].querySelector('.card-content-edit-reset-button');
		saveButton = modalCards[currentIndex].querySelector('.card-content-edit-save-button');
		image = modalCards[currentIndex].querySelector('img');
		const inputs = modalCards[currentIndex].querySelectorAll('input');

		opacitySlider = inputs[0];
		hueSlider = inputs[1];
		saturationSlider = inputs[2];
		lightnessSlider = inputs[3];

		// Display only the selected cards + neighbours
		modalCards[index].style.display = 'flex';
		modalCards[index].style.pointerEvents = 'auto';
		let previousCard, nextCard;

		// Special case: 2 cards
		if (modalCards.length === 2) {
			let neighbour = Math.abs(1 - index);
			modalCards[neighbour].style.display = 'flex';
			modalCards[neighbour].style.transform = neighbour == 0 ? 'translateX(-30%) rotateZ(-8deg) scale(0.7)' : 'translateX(30%) rotateZ(8deg) scale(0.7)';
			modalCards[neighbour].style.filter = 'blur(2px)';
			modalCards[neighbour].style.zIndex = '0';
			modalCards[neighbour].style.pointerEvents = 'none';

			modalPreviousButton.style.display = 'none';
			modalNextButton.style.display = 'none';
			modal.showModal();
			return;
		}

		previousCard = index ? index - 1 : siblings.length - 1;
		nextCard = index == (siblings.length - 1) ? 0 : index + 1;

		modalCards[previousCard].style.display = 'flex';
		modalCards[previousCard].style.transform = 'translateX(-30%) rotateZ(-8deg) scale(0.7)';
		modalCards[previousCard].style.filter = 'blur(2px)';
		modalCards[previousCard].style.zIndex = '0';
		modalCards[previousCard].style.pointerEvents = 'none';

		modalCards[nextCard].style.display = 'flex';
		modalCards[nextCard].style.transform = 'translateX(30%) rotateZ(8deg) scale(0.7)';
		modalCards[nextCard].style.filter = 'blur(2px)';
		modalCards[nextCard].style.zIndex = '0';
		modalCards[nextCard].style.pointerEvents = 'none';

		modal.showModal();
	};

	const collageButtons = document.querySelectorAll('.collage-btn-container button');

	const removeSelectedCollage = () => {
		const cards = document.querySelectorAll('.card');
		cards.forEach(card => {
			const hasCheckmark = !!card.querySelector('.card-checkmark');
			if (hasCheckmark) {
				card.querySelector('.card-checkmark').remove();
			}
		});
		const collageButtonContainer = document.querySelector('.collage-btn-container');
		collageButtonContainer.style.display = 'none';
	}

	collageButtons[0].addEventListener('click', () => {alert("not ready")});
	collageButtons[1].addEventListener('click', removeSelectedCollage);

	// Normal click on a card (modal opens up)
	const handleClick = (e) => {
		removeSelectedCollage();
		updateModal(e);
	};


	// Differentiate between Click and Ctrl+Click
	for (const card of cards) {
		card.addEventListener('click', (e) => {
			if (e.ctrlKey) {
				handleCtrlClick(e);
			} else {
				handleClick(e);
			}
		});
	}

	// < btn
	modalPreviousButton.addEventListener('click', (e) => {
		if (modalCards.length < 3) return;

		opacitySlider.value = 100;
		hueSlider.value = 0;
		saturationSlider.value = 100;
		lightnessSlider.value = 100;
		updateFilters();

		const leftIndex = (currentIndex - 1 + modalCards.length) % modalCards.length;
		const newLeftIndex = (leftIndex - 1 + modalCards.length) % modalCards.length;
		const rightIndex = (currentIndex + 1) % modalCards.length;

		const newLeftCard = modalCards[newLeftIndex];
		const leftCard = modalCards[leftIndex];
		const centerCard = modalCards[currentIndex];
		const rightCard = modalCards[rightIndex];

		currentIndex = (currentIndex - 1 + modalCards.length) % modalCards.length;
		editButton = modalCards[currentIndex].querySelector('.card-content-edit-button');
		resetButton = modalCards[currentIndex].querySelector('.card-content-edit-reset-button');
		saveButton = modalCards[currentIndex].querySelector('.card-content-edit-save-button');
		image = modalCards[currentIndex].querySelector('img');
		const inputs = modalCards[currentIndex].querySelectorAll('input');

		opacitySlider = inputs[0];
		hueSlider = inputs[1];
		saturationSlider = inputs[2];
		lightnessSlider = inputs[3];

		newLeftCard.style.transform = 'translateX(-30%) rotateZ(-8deg) scale(0.7)';
		newLeftCard.style.zIndex = '0';
		newLeftCard.style.filter = 'blur(2px)';
		newLeftCard.style.pointerEvents = 'none';

		leftCard.style.transform = 'translateX(0) rotateZ(0deg) scale(1.0)';
		leftCard.style.zIndex = '1';
		leftCard.style.filter = 'blur(0px)';
		leftCard.style.pointerEvents = 'auto';

		centerCard.style.transform = 'translateX(30%) rotateZ(8deg) scale(0.7)';
		centerCard.style.zIndex = '0';
		centerCard.style.filter = 'blur(2px)';
		centerCard.style.pointerEvents = 'none';

		newLeftCard.style.display = 'flex';
		rightCard.style.display = 'none';
		rightCard.style.pointerEvents = 'none';
	});


	// > btn
	modalNextButton.addEventListener('click', (e) => {
		if (modalCards.length < 3) return;

		opacitySlider.value = 100;
		hueSlider.value = 0;
		saturationSlider.value = 100;
		lightnessSlider.value = 100;
		updateFilters();

		const rightIndex = (currentIndex + 1) % modalCards.length;
		const newRightIndex = (rightIndex + 1) % modalCards.length;
		const leftIndex = (currentIndex - 1 + modalCards.length) % modalCards.length;

		const newRightCard = modalCards[newRightIndex];
		const rightCard = modalCards[rightIndex];
		const centerCard = modalCards[currentIndex];
		const leftCard = modalCards[leftIndex];

		currentIndex = (currentIndex + 1) % modalCards.length;
		editButton = modalCards[currentIndex].querySelector('.card-content-edit-button');
		resetButton = modalCards[currentIndex].querySelector('.card-content-edit-reset-button');
		saveButton = modalCards[currentIndex].querySelector('.card-content-edit-save-button');
		image = modalCards[currentIndex].querySelector('img');
		const inputs = modalCards[currentIndex].querySelectorAll('input');

		opacitySlider = inputs[0];
		hueSlider = inputs[1];
		saturationSlider = inputs[2];
		lightnessSlider = inputs[3];

		newRightCard.style.transform = 'translateX(30%) rotateZ(8deg) scale(0.7)';
		newRightCard.style.zIndex = '0';
		newRightCard.style.filter = 'blur(2px)';
		newRightCard.style.pointerEvents = 'none';

		rightCard.style.transform = 'translateX(0) rotateZ(0deg) scale(1.0)';
		rightCard.style.zIndex = '1';
		rightCard.style.filter = 'blur(0px)';
		rightCard.style.pointerEvents = 'auto';

		centerCard.style.transform = 'translateX(-30%) rotateZ(-8deg) scale(0.7)';
		centerCard.style.zIndex = '0';
		centerCard.style.filter = 'blur(2px)';
		centerCard.style.pointerEvents = 'none';

		leftCard.style.display = 'none';
		newRightCard.style.display = 'flex';
		newRightCard.style.pointerEvents = 'none';
	});


	const handleSliders = () => {
		const description = modalCards[currentIndex].querySelector('.card-content-description');
		const comments = modalCards[currentIndex].querySelector('.card-content-comments');

		if (description.style.display === 'none' || comments.style.display === 'none') {
			comments.style.display = 'block';
			modalCards[currentIndex].querySelector('.card-content-edit').style.display = 'none';
			editButton.style.backgroundColor = 'rgba(0, 0, 0, 0)';
		} else {
			comments.style.display = 'none';
			modalCards[currentIndex].querySelector('.card-content-edit').style.display = 'block';
			editButton.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
		}
	};

});
