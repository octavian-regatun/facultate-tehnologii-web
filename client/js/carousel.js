import savePhoto from "./savePhoto.js";
import updatePhotoData from "./updatePhotoData.js";
import exportComments from "./export.js";
import importComments from "./import.js";
import createCollage from "./collage.js";
import google from "./uploadGoogle.js";
import instagram from "./uploadInstagram.js";

document.addEventListener('photosLoaded', () => {
	// Remove all event listeners
	// When a new photo is added, the AJAX will add eventListeners on every component
	// But on the old components, there are already event listeners
	// Therefore, they will trigger twice. Work-around to remove this "bug"
	// JS does not provide a way to add an event lister if there isn't already one
	// Neither does it provide a way to remove an arrow function w/ parameters
	function removeAllEventListeners(element) {
		const newElement = element.cloneNode(true);
		element.parentNode.replaceChild(newElement, element);

		Array.from(newElement.children).forEach(child => removeAllEventListeners(child));
	}
	removeAllEventListeners(document.querySelector('.container'));
	removeAllEventListeners(document.querySelector('.modal'));


	const cards = document.querySelectorAll('.container-grid .card');
	const modal = document.querySelector('dialog');
	const modalPreviousButton = document.querySelector('.modal-previous-button');
	const modalNextButton = document.querySelector('.modal-next-button');

	if (cards.length) {
		const noImages = document.querySelector('.no-images');
		if (noImages) {
			noImages.remove();
		}
	}

	if (!modal) {
		console.error('Modal not found');
		return;
	}

	let modalClose, modalCards, editButton, refreshButton, colorButton, image, opacitySlider, hueSlider, saturationSlider, lightnessSlider, resetButton, saveButton, importButton, exportButton, publishButtons;
	let currentIndex = 0;
	let drawing = false, canvas = null, ctx = null;
	let clickedCards = [];
	let clipPathPoints = [];

	// Initialize (needed if the modal is closed and reopened)
	const initializeModalElements = () => {
		modalCards = modal.querySelectorAll('.card');
		if (modalCards.length === 0) {
			displayNoPhotosMessage("Oops..Looks like you don't have any photos. Try fetching some first!");
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


	if (!modalPreviousButton || !modalNextButton) {
		console.error('Modal navigation buttons not found');
		return;
	}

	let clickedCard;

	// Modal event listeners
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
			publishButtons[0].style.display = 'block';
			publishButtons[1].style.display = 'none';
			publishButtons[2].style.display = 'none';
			const oldCurrent = document.querySelector('.current');
			oldCurrent.classList.remove('current');
			modal.close();
			event.stopPropagation();
		}

		// sliders
		if (editButton && editButton.contains(event.target)) {
			handleSliders();
		}

		if (refreshButton && refreshButton.contains(event.target)) {
			const id = refreshButton.getAttribute('photo-id');
			updatePhotoData(modalCards[currentIndex], id);
		}

		// reset filters btn
		if (resetButton && resetButton.contains(event.target)) {
			opacitySlider.value = 100;
			hueSlider.value = 0;
			saturationSlider.value = 100;
			lightnessSlider.value = 100;
			updateFilters();
			resetClipPath();
		}

		// save photo btn
		if (saveButton && saveButton.contains(event.target)) {
			const opacity = opacitySlider.value / 100;
			const hue = hueSlider.value;
			const saturation = saturationSlider.value + '%';
			const lightness = lightnessSlider.value + '%';
			const filters = `opacity(${opacity}) hue-rotate(${hue}deg) saturate(${saturation}) brightness(${lightness})`;
			savePhoto(image, undefined, undefined, undefined, true, filters);
			publishButtons[0].style.display = 'block';
			publishButtons[1].style.display = 'none';
			publishButtons[2].style.display = 'none';
			resetClipPath();
			modal.close();
		}

		// import comments
		if (importButton && importButton.contains(event.target)) {
			const card = event.target.closest('.card');
			const id = card.querySelector('.card-image').getAttribute("photo-id");
			importComments(card, id);

			// These buttons are deleted, so reinitialize them
			// importButton = modalCards[currentIndex].querySelector('.import-button');
			// exportButton = modalCards[currentIndex].querySelector('.export-button');
			// console.log(importButton);
		}

		// export comments in a .zip with .json & .csv
		if (exportButton && exportButton.contains(event.target)) {
			const card = event.target.closest('.card');
			const id = card.querySelector('.card-image').getAttribute("photo-id");
			exportComments(id);
		}

		// top buttons
		if (publishButtons && publishButtons[0].contains(event.target)) {
			publishButtons[0].style.display = 'none';
			publishButtons[1].style.display = 'block';
			publishButtons[2].style.display = 'block';
		}

		if (publishButtons && publishButtons[1].contains(event.target)) {
			const card = event.target.closest('.card');
			const img = card.querySelector('.card-image');
			google(img);
		}

		if (publishButtons && publishButtons[2].contains(event.target)) {
			const card = event.target.closest('.card');
			const img = card.querySelector('.card-image');
			instagram(img);
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
			clickedCard.classList.remove('zoomed');
			clickedCards = clickedCards.filter(card => card !== clickedCard);
		} else {
			// A new card is being selected. Check if there are already 6
			if (document.querySelectorAll('.card-checkmark').length >= 6) {
				const collageLimit = document.querySelector('.collage-limit');
				collageLimit.style.display = 'block';
				setTimeout(function () {
					collageLimit.style.display = 'none';
				}, 3000);
			} else {
				const checkmark = document.createElement('img');
				checkmark.src = '../svgs/checkmark.svg';
				checkmark.className = 'card-checkmark';
				clickedCard.prepend(checkmark);
				clickedCard.classList.add('zoomed');
				clickedCards.push(clickedCard);
			}
		}

		const collageButtonContainer = document.querySelector('.collage-btn-container');
		if (document.querySelectorAll('.card-checkmark').length >= 2) {
			collageButtonContainer.style.display = 'flex';
		} else {
			collageButtonContainer.style.display = 'none';
		}

		e.preventDefault();
		e.stopPropagation();
	};

	// Modal opens up settings
	const updateModal = (e) => {
		if (!initializeModalElements())
			return;

		// Special case: 1 card
		if (modalCards.length === 1) {
			modalCards[0].style.display = 'flex';
			modalCards[0].classList.add("current");
			updateCurrentButtons(0);
			modalPreviousButton.style.display = 'none';
			modalNextButton.style.display = 'none';
			modal.showModal();
			return;
		}


		clickedCard = e.target.closest('.card');
		const siblings = Array.from(clickedCard.parentElement.children);
		const index = siblings.indexOf(clickedCard);
		currentIndex = index;

		updateCurrentButtons(currentIndex);

		// Display only the selected cards + neighbours
		modalCards[index].style.display = 'flex';
		modalCards[index].style.pointerEvents = 'auto';
		modalCards[index].classList.add("current");
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
				card.classList.remove('zoomed');
			}
		});
		clickedCards = [];
		const collageButtonContainer = document.querySelector('.collage-btn-container');
		collageButtonContainer.style.display = 'none';
	}

	collageButtons[0].addEventListener('click', () => {
		const navbar = document.querySelector('.navbar');
		const sidebar = document.querySelector('.sidebar');
		const container = document.querySelector('.container');
		const header = document.querySelector('.card-header');
		navbar.classList.add("blur-background");
		sidebar.classList.add("blur-background");
		container.classList.add("blur-background");
		header.classList.add("blur-background");
		createCollage(clickedCards);
		removeSelectedCollage();
	});
	collageButtons[1].addEventListener('click', removeSelectedCollage);

	// Normal click on a card (modal opens up)
	const handleClick = (e) => {
		removeSelectedCollage();
		updateModal(e);
	};



	// Differentiate between Click and Ctrl+Click
	let longPressTimer;

	const handleLongPress = (e) => {
		handleCtrlClick(e);
	};

	const startLongPressTimer = (e) => {
		longPressTimer = setTimeout(() => handleLongPress(e), 500);
	};

	const cancelLongPressTimer = () => {
		clearTimeout(longPressTimer);
	};

	for (const card of cards) {
		card.addEventListener('click', (e) => {
			if (e.ctrlKey) {
				handleCtrlClick(e);
			} else {
				const clicked = e.target.closest('.card');
				if (clicked.querySelector('.delete-div').contains(e.target)) {
					openDeleteConfirmation(clicked);
				} else {
					handleClick(e);
				}
			}
		});

		// Phone version
		card.addEventListener('touchstart', (e) => {
			startLongPressTimer(e);
		});

		card.addEventListener('touchend', (e) => {
			cancelLongPressTimer();
			if (!longPressTimer) {
				handleClick(e);
			}
		});

		card.addEventListener('touchmove', cancelLongPressTimer);
		card.addEventListener('touchcancel', cancelLongPressTimer);
	}

	function carousel(direction) {
		resetClipPath();
		if (modalCards.length < 3) return;

		publishButtons[0].style.display = 'block';
		publishButtons[1].style.display = 'none';
		publishButtons[2].style.display = 'none';

		opacitySlider.value = 100;
		hueSlider.value = 0;
		saturationSlider.value = 100;
		lightnessSlider.value = 100;
		updateFilters();

		const nextIndex = (currentIndex + direction + modalCards.length) % modalCards.length;
		const newNextIndex = (nextIndex + direction + modalCards.length) % modalCards.length;
		const oppositeIndex = (currentIndex - direction + modalCards.length) % modalCards.length;

		const newCard = modalCards[newNextIndex];
		const nextCard = modalCards[nextIndex];
		const centerCard = modalCards[currentIndex];
		const oppositeCard = modalCards[oppositeIndex];

		currentIndex = nextIndex;
		updateCurrentButtons(currentIndex);

		newCard.style.transform = `translateX(${direction * 30}%) rotateZ(${direction * 8}deg) scale(0.7)`;
		newCard.style.zIndex = '0';
		newCard.style.filter = 'blur(2px)';
		newCard.style.pointerEvents = 'none';

		nextCard.style.transform = 'translateX(0) rotateZ(0deg) scale(1.0)';
		nextCard.style.zIndex = '1';
		nextCard.style.filter = 'blur(0px)';
		nextCard.style.pointerEvents = 'auto';

		centerCard.style.transform = `translateX(${-direction * 30}%) rotateZ(${-direction * 8}deg) scale(0.7)`;
		centerCard.style.zIndex = '0';
		centerCard.style.filter = 'blur(2px)';
		centerCard.style.pointerEvents = 'none';

		if (modalCards.length !== 3) {
			newCard.style.display = 'flex';
			oppositeCard.style.display = 'none';
			oppositeCard.style.pointerEvents = 'none';
		}

		const oldCurrent = document.querySelector('.current');
		oldCurrent.classList.remove('current');
		nextCard.classList.add("current");

		// Reset edit buttons
		handleSliders();
	}

	// < btn
	modalPreviousButton.addEventListener('click', (e) => {
		carousel(-1);
	});

	// > btn
	modalNextButton.addEventListener('click', (e) => {
		carousel(1);
	});


	let lastX, lastY, lastTime;

	const handleSliders = () => {
		const description = modalCards[currentIndex].querySelector('.card-content-description');
		const comments = modalCards[currentIndex].querySelector('.card-content-comments');

		if (description.style.display === 'none' || comments.style.display === 'none') {
			if (refreshButton) {
				refreshButton.style.display = 'block';
			}
			comments.style.display = 'block';
			colorButton.style.display = 'none';
			modalClose.style.display = 'block';
			modalCards[currentIndex].querySelector('.card-content-edit').style.display = 'none';
			editButton.style.backgroundColor = 'rgba(0, 0, 0, 0)';
			const canvas = modalCards[currentIndex].querySelector('canvas');
			canvas.removeEventListener('mousedown', startDrawing, true);
			canvas.removeEventListener('mousemove', draw, true);
			canvas.removeEventListener('mouseup', stopDrawing, true);
			canvas.removeEventListener('mouseout', stopDrawing, true);

			drawing = false;
			ctx = null;
		} else {
			if (refreshButton) {
				refreshButton.style.display = 'none';
			}
			comments.style.display = 'none';
			colorButton.style.display = 'block';
			modalClose.style.display = 'none';
			modalCards[currentIndex].querySelector('.card-content-edit').style.display = 'block';
			editButton.style.backgroundColor = 'rgba(102, 204, 175, 1)';

			canvas = modalCards[currentIndex].querySelector('canvas');
			const photo = modalCards[currentIndex].querySelector('img');
			ctx = canvas.getContext('2d');

			canvas.width = photo.width;
			canvas.height = photo.height;

			drawing = false;

			canvas.addEventListener('mousedown', startDrawing);
			canvas.addEventListener('mousemove', draw);
			canvas.addEventListener('mouseup', stopDrawing);
			canvas.addEventListener('mouseout', stopDrawing);

			ctx.strokeStyle = colorButton.value;
			colorButton.addEventListener('input', (e) => {
				ctx.strokeStyle = e.target.value;
			});
		}
	};

	const updateCurrentButtons = (index) => {
		modalClose = modalCards[index].querySelector('.modal-close');
		editButton = modalCards[index].querySelector('.card-content-edit-button');
		colorButton = modalCards[index].querySelector('.color-selector');
		refreshButton = modalCards[index].querySelector('.card-content-refresh-button') || null;
		resetButton = modalCards[index].querySelector('.card-content-edit-reset-button');
		saveButton = modalCards[index].querySelector('.card-content-edit-save-button');
		importButton = modalCards[index].querySelector('.import-button');
		exportButton = modalCards[index].querySelector('.export-button');
		publishButtons = modalCards[index].querySelectorAll('.publish-btn');
		image = modalCards[index].querySelector('img');
		const inputs = modalCards[index].querySelector('.card-content-edit').querySelectorAll('input');

		opacitySlider = inputs[0];
		hueSlider = inputs[1];
		saturationSlider = inputs[2];
		lightnessSlider = inputs[3];
	}

	// Draw logic
	// (The color is found in handleSliders, on the else branch)
	const startDrawing = (e) => {
		if (modalCards[currentIndex].querySelector('.card-content-comments').style.display === 'block') {
			return;
		}
		if (e.ctrlKey) {
			addClipPathPoint(e);
			return;
		}
		drawing = true;
		lastX = e.clientX;
		lastY = e.clientY;
		lastTime = Date.now();
		if (ctx) {
			draw(e);
		}
	};

	const draw = (e) => {
		if (!drawing || !ctx || e.ctrlKey) return;

		const rect = canvas.getBoundingClientRect();
		const currentX = e.clientX - rect.left;
		const currentY = e.clientY - rect.top;
		const currentTime = Date.now();

		const distance = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));
		const time = currentTime - lastTime;
		const speed = distance / time;

		ctx.lineWidth = Math.max(1, 5 - speed * 2.5);
		ctx.lineCap = 'round';

		ctx.lineTo(currentX, currentY);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(currentX, currentY);

		lastX = currentX;
		lastY = currentY;
		lastTime = currentTime;
	};

	const stopDrawing = (e) => {
		if (e.ctrlKey) return;
		drawing = false;
		if (ctx) {
			ctx.beginPath();
		}
	};


	// Canvas needs to be updated on resize
	window.addEventListener('resize', () => {
		if (canvas && ctx) {
			// Save
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			canvas.width = image.width;
			canvas.height = image.height;

			// Restore
			ctx.putImageData(imageData, 0, 0);
		}
	});

	const addClipPathPoint = (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		clipPathPoints.push(`${x}% ${y}%`);
		if (clipPathPoints.length > 2) {
			updateClipPath();
		}
		addClipPathDiv(x, y);
	};

	const addClipPathDiv = (x, y) => {
		const div = document.createElement('div');
		div.classList.add('clip-path-point');
		div.style.left = `calc(${x}% - 6px)`;
		div.style.top = `calc(${y}% - 6px)`;
		const editor = modalCards[currentIndex].querySelector('.photo-editor');
		editor.appendChild(div);
	};

	const updateClipPath = () => {
		const clipPath = `polygon(${clipPathPoints.join(', ')})`;
		image.style.clipPath = clipPath;
	};

	const resetClipPath = () => {
		clipPathPoints = [];
		image.style.clipPath = '';
		const pointDivs = modalCards[currentIndex].querySelectorAll('.clip-path-point');
		pointDivs.forEach(div => div.remove());
	};
});
