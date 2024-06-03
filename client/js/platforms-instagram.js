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
      console.error('No modal cards found');
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

    // Update the single card if there is only one card
    if (modalCards.length === 1) {
      const card = modalCards[0];
      card.querySelector('.card-image').src = imageSrc;
      card.querySelector('.card-content-description').textContent = description;
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

    // Remove the carousel feature if there are UNDER 3 cards
    if (siblings.length < 3) {
      if (modalCards.length > 1) {
        modalCards[0].style.display = siblings.length === 2 ? '' : 'none';
        modalCards[2].style.display = 'none';
      }
      modalPreviousButton.style.display = siblings.length === 2 ? '' : 'none';
      modalNextButton.style.display = siblings.length === 2 ? '' : 'none';
    } else {
      modalCards[0].style.display = '';
      modalCards[2].style.display = '';
      modalPreviousButton.style.display = '';
      modalNextButton.style.display = '';
    }

    // If there are two cards, set the other card based on the position
    if (siblings.length === 2) {
      const otherCard = siblings[index === 0 ? 1 : 0];
      const targetCard = modalCards[index === 0 ? 2 : 0];
      targetCard.querySelector('.card-image').src = otherCard.querySelector('img').src;
      targetCard.querySelector('.card-content-description').textContent = otherCard.querySelector('.card-content-description').textContent;
      modal.showModal();
      return;
    }

    // Left card
    let previousCard;
    if (index) {
      previousCard = siblings[index - 1];
    } else {
      previousCard = siblings[siblings.length - 1];
    }

    if (modalCards.length > 1) {
      modalCards[0].querySelector('.card-image').src = previousCard.querySelector('img').src;
      modalCards[0].querySelector('.card-content-description').textContent = previousCard.querySelector('.card-content-description').textContent;
    }

    // Right card
    let nextCard;
    if (index == siblings.length - 1) {
      nextCard = siblings[0];
    } else {
      nextCard = siblings[index + 1];
    }

    if (modalCards.length > 2) {
      modalCards[2].querySelector('.card-image').src = nextCard.querySelector('img').src;
      modalCards[2].querySelector('.card-content-description').textContent = nextCard.querySelector('.card-content-description').textContent;
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
