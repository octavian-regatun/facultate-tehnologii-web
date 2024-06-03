document.addEventListener('photosLoaded', () => {
  const cards = document.querySelectorAll('.container-grid .card');
  const modal = document.querySelector('dialog');

  if (!modal) {
    console.error('Modal not found');
    return;
  }

  let modalClose, modalCards, editButton;

  // Ensure the modal and its cards are created before accessing them
  const initializeModalElements = () => {
    modalCards = modal.querySelectorAll('.card');
    if (modalCards.length === 0) {
      return false;
    }
    if (modalCards.length >= 1) {
      modalClose = modalCards[0].querySelector('.modal-close');
      editButton = modalCards[0].querySelector('.card-content-edit-button');
    }
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
    clickedCard = e.target.closest('.card');
    const imageSrc = clickedCard.querySelector('img').src;
    const description = clickedCard.querySelector('.card-content-description').textContent;

    if (!initializeModalElements()) {
      return;
    }

    // Special case: 1 card
    // Override the properties in the CSS file for the 1st card
    if (modalCards.length === 1) {
      modalCards[0].style.transform = 'none';
      modalCards[0].style.filter = 'blur(0px)';
      modalCards[0].style.zIndex = '3';
      modalCards[0].style.pointerEvents = 'auto';

      modalPreviousButton.style.display = 'none';
      modalNextButton.style.display = 'none';
      modal.showModal();
      return;
    }

    // The clicked card will be the second one in the carousel DOM
    const secondCard = modalCards[1];
    secondCard.querySelector('.card-image').src = imageSrc;
    secondCard.querySelector('.card-content-description').textContent = description;

    // Get the index for the clicked card
    const siblings = Array.from(clickedCard.parentElement.children);
    const index = siblings.indexOf(clickedCard);

    modalCards[0].style.display = '';
    modalPreviousButton.style.display = '';
    modalNextButton.style.display = '';

    if (modalCards.length > 2) {
      modalCards[2].style.display = '';
    }

    // Left card
    let previousCard = index ? siblings[index - 1] : siblings[siblings.length - 1];

    modalCards[0].querySelector('.card-image').src = previousCard.querySelector('img').src;
    modalCards[0].querySelector('.card-content-description').textContent = previousCard.querySelector('.card-content-description').textContent;

    // Right card - if it exists. Otherwise just hide the arrows
    if (modalCards.length > 2) {
      let nextCard = index == (siblings.length - 1) ? siblings[0] : siblings[index + 1];
      modalCards[2].querySelector('.card-image').src = nextCard.querySelector('img').src;
      modalCards[2].querySelector('.card-content-description').textContent = nextCard.querySelector('.card-content-description').textContent;
    } else {
      modalPreviousButton.style.display = 'none';
      modalNextButton.style.display = 'none';
    }

    modal.showModal();
  };

  // Normal click on a card (modal opens up)
  const handleClick = (e) => {
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

  // Carousel logic
  modalPreviousButton.addEventListener('click', (e) => {
    if (modalCards.length < 3) return;

    const leftCard = modal.querySelector('.card:nth-of-type(1)');
    const centerCard = modal.querySelector('.card:nth-of-type(2)');
    const rightCard = modal.querySelector('.card:nth-of-type(3)');

    leftCard.style.transform = 'translateX(0) rotateZ(0deg) scale(1.0)';
    leftCard.style.zIndex = '1';
    leftCard.style.filter = 'blur(0px)';
    centerCard.style.transform = 'translateX(30%) rotateZ(8deg) scale(0.7)';
    centerCard.style.zIndex = '0';
    centerCard.style.filter = 'blur(2px)';
    rightCard.style.transform = 'translateX(-30%) rotateZ(-8deg) scale(0.7)';

    const animationDuration = 200;
    setTimeout(() => {
      // DOM order for :nth-of-type
      leftCard.parentElement.appendChild(rightCard);
      centerCard.parentElement.appendChild(leftCard);
      rightCard.parentElement.appendChild(centerCard);
      if (!initializeModalElements()) {
        return;
      }

      clickedCard = clickedCard.previousElementSibling;
      if (!clickedCard) {
        const cardArray = Array.from(cards);
        clickedCard = cardArray[cardArray.length - 1];
      }
      let previousCard = clickedCard.previousElementSibling;
      if (!previousCard) {
        const cardArray = Array.from(cards);
        previousCard = cardArray[cardArray.length - 1];
      }

      rightCard.querySelector('.card-image').src = previousCard.querySelector('img').src;
      rightCard.querySelector('.card-content-description').textContent = previousCard.querySelector('.card-content-description').textContent;

    }, animationDuration);
  });

  modalNextButton.addEventListener('click', (e) => {
    if (modalCards.length < 3) return;

    const leftCard = modal.querySelector('.card:nth-of-type(1)');
    const centerCard = modal.querySelector('.card:nth-of-type(2)');
    const rightCard = modal.querySelector('.card:nth-of-type(3)');

    rightCard.style.transform = 'translateX(0) rotateZ(0deg) scale(1.0)';
    rightCard.style.zIndex = '1';
    rightCard.style.filter = 'blur(0px)';
    leftCard.style.transform = 'translateX(30%) rotateZ(8deg) scale(0.7)';
    leftCard.style.zIndex = '0';
    leftCard.style.filter = 'blur(2px)';
    centerCard.style.transform = 'translateX(-30%) rotateZ(-8deg) scale(0.7)';

    const animationDuration = 200;
    setTimeout(() => {
      // DOM order for :nth-of-type
      leftCard.parentElement.appendChild(centerCard);
      centerCard.parentElement.appendChild(rightCard);
      rightCard.parentElement.appendChild(leftCard);
      if (!initializeModalElements()) {
        return;
      }

      clickedCard = clickedCard.nextElementSibling;
      if (!clickedCard) {
        const cardArray = Array.from(cards);
        clickedCard = cardArray[0];
      }
      let nextCard = clickedCard.nextElementSibling;
      if (!nextCard) {
        const cardArray = Array.from(cards);
        nextCard = cardArray[0];
      }

      leftCard.querySelector('.card-image').src = nextCard.querySelector('img').src;
      leftCard.querySelector('.card-content-description').textContent = nextCard.querySelector('.card-content-description').textContent;

    }, animationDuration);
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
