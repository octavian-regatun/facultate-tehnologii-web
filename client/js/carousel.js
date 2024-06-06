document.addEventListener('photosLoaded', () => {
	const cards = document.querySelectorAll('.container-grid .card');
	const modal = document.querySelector('dialog');

	if (!modal) {
		console.error('Modal not found');
		return;
	}

	let modalClose, modalCards, editButton;
	let currentIndex;

	// Initialize (needed if the modal is closed and reopened)
	const initializeModalElements = () => {
		modalCards = modal.querySelectorAll('.card');
		if (modalCards.length === 0) {
			return false;
		}
		modalClose = modalCards[0].querySelector('.modal-close');
		editButton = modalCards[0].querySelector('.card-content-edit-button');
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
			modal.close();
			event.stopPropagation();
		}

		// sliders
		if (editButton && editButton.contains(event.target)) {
			handleSliders();
		}
	});

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

		const collageButton = document.querySelector('.collage-button');
		if (document.querySelectorAll('.card-checkmark').length >= 1) {
			collageButton.style.display = 'block';
		} else {
			collageButton.style.display = 'none';
		}
	};

	// Modal opens up settings
	const updateModal = (e) => {
		if (!initializeModalElements())
			return;

		// Special case: 1 card
		if (modalCards.length === 1) {
			modalPreviousButton.style.display = 'none';
			modalNextButton.style.display = 'none';
			modal.showModal();
			return;
		}


		clickedCard = e.target.closest('.card');
		const siblings = Array.from(clickedCard.parentElement.children);
		const index = siblings.indexOf(clickedCard);
		currentIndex = index;

		// Display only the selected cards + neighbours
		modalCards[index].style.display = 'flex';
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

	// Normal click on a card (modal opens up)
	const handleClick = (e) => {
		const cards = document.querySelectorAll('.card');
		cards.forEach(card => {
			const hasCheckmark = !!card.querySelector('.card-checkmark');
			if (hasCheckmark) {
				card.querySelector('.card-checkmark').remove();
			}
		});
		const collageButton = document.querySelector('.collage-button');
		collageButton.style.display = 'none';
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

		const leftIndex = (currentIndex - 1 + modalCards.length) % modalCards.length;
		const newLeftIndex = (leftIndex - 1 + modalCards.length) % modalCards.length;
		const rightIndex = (currentIndex + 1) % modalCards.length;

		const newLeftCard = modalCards[newLeftIndex];
		const leftCard = modalCards[leftIndex];
		const centerCard = modalCards[currentIndex];
		const rightCard = modalCards[rightIndex];

		currentIndex = (currentIndex - 1 + modalCards.length) % modalCards.length;

		newLeftCard.style.transform = 'translateX(-30%) rotateZ(-8deg) scale(0.7)';
		newLeftCard.style.zIndex = '0';
		newLeftCard.style.filter = 'blur(2px)';

		leftCard.style.transform = 'translateX(0) rotateZ(0deg) scale(1.0)';
		leftCard.style.zIndex = '1';
		leftCard.style.filter = 'blur(0px)';

		centerCard.style.transform = 'translateX(30%) rotateZ(8deg) scale(0.7)';
		centerCard.style.zIndex = '0';
		centerCard.style.filter = 'blur(2px)';

		newLeftCard.style.display = 'flex';
		rightCard.style.display = 'none';
	});


	// > btn
	modalNextButton.addEventListener('click', (e) => {
		if (modalCards.length < 3) return;

		const rightIndex = (currentIndex + 1) % modalCards.length;
		const newRightIndex = (rightIndex + 1) % modalCards.length;
		const leftIndex = (currentIndex - 1 + modalCards.length) % modalCards.length;

		const newRightCard = modalCards[newRightIndex];
		const rightCard = modalCards[rightIndex];
		const centerCard = modalCards[currentIndex];
		const leftCard = modalCards[leftIndex];

		currentIndex = (currentIndex + 1) % modalCards.length;

		newRightCard.style.transform = 'translateX(30%) rotateZ(8deg) scale(0.7)';
		newRightCard.style.zIndex = '0';
		newRightCard.style.filter = 'blur(2px)';

		rightCard.style.transform = 'translateX(0) rotateZ(0deg) scale(1.0)';
		rightCard.style.zIndex = '1';
		rightCard.style.filter = 'blur(0px)';

		centerCard.style.transform = 'translateX(-30%) rotateZ(-8deg) scale(0.7)';
		centerCard.style.zIndex = '0';
		centerCard.style.filter = 'blur(2px)';

		leftCard.style.display = 'none';
		newRightCard.style.display = 'flex';
	});


	const handleSliders = (e) => {
		const description = modal.querySelector('.card:nth-of-type(2) .card-content-description');
		const comments = modal.querySelector('.card:nth-of-type(2) .card-content-comments');

		if (description.style.display === 'none' || comments.style.display === 'none') {
			modal.querySelector('.card:nth-of-type(2) .card-content-comments').style.display = 'block';
			modal.querySelector('.card:nth-of-type(2) .card-content-edit').style.display = 'none';
			editButton.style.backgroundColor = 'rgba(0, 0, 0, 0)';
		} else {
			modal.querySelector('.card:nth-of-type(2) .card-content-comments').style.display = 'none';
			modal.querySelector('.card:nth-of-type(2) .card-content-edit').style.display = 'block';
			editButton.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
		}
	};
});
