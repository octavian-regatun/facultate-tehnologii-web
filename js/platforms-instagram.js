const cards = document.querySelectorAll('.container-grid .card');
const modal = document.querySelector('dialog');

// not a const because the order of cards will be updated !
let modalClose = document.querySelector('.modal .card:nth-of-type(2) .modal-close');
let modalCards = modal.querySelectorAll('.card');
let editButton = document.querySelector('.modal .card:nth-of-type(2) .card-content-edit-button');

// TODO update cards & modalCards when aggregating more photos

const modalPreviousButton = document.querySelector('.modal-previous-button');
const modalNextButton = document.querySelector('.modal-next-button');

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
  if ((!isCard && !isButton) || modalClose.contains(event.target)) {
    modal.close();
    event.stopPropagation();
  }

  // sliders
  if(editButton.contains(event.target)) {
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

  if (document.querySelectorAll('.card-checkmark').length >= 1) {
    const collageButton = document.querySelector('.collage-button');
    collageButton.style.display = 'block';
  } else {
    const collageButton = document.querySelector('.collage-button');
    collageButton.style.display = 'none';
  }
};

// Modal opens up settings
const updateModal = (e) => {
  clickedCard = e.target.closest('.card');
  const imageSrc = clickedCard.querySelector('img').src;
  const description = clickedCard.querySelector(
    '.card-content-description'
  ).textContent;

  modalCards = modal.querySelectorAll('.card');
  // The clicked card will be the second one in the carrousel DOM
  const secondCard = modalCards[1];
  secondCard.querySelector('.card-image').src = imageSrc;
  secondCard.querySelector('.card-content-description').textContent = description;

  // Get the index for the clicked card
  const siblings = Array.from(clickedCard.parentElement.children);
  const index = siblings.indexOf(clickedCard);

  // Remove the carousell feature if there are UNDER 3 cards
  if (siblings.length < 3) {
    modalCards[0].style.display = 'none';
    modalCards[2].style.display = 'none';
    modalPreviousButton.style.display = 'none';
    modalNextButton.style.display = 'none';
  }

  // Left card
  let previousCard;
  if (index) {
    previousCard = siblings[index - 1];
  }
  else {
    previousCard = siblings[siblings.length - 1];
  }

  modalCards[0].querySelector('.card-image').src =
    previousCard.querySelector('img').src;
  modalCards[0].querySelector('.card-content-description').textContent =
    previousCard.querySelector('.card-content-description').textContent;

  // Right card
  let nextCard;
  if (index == siblings.length - 1) {
    nextCard = siblings[0];
  }
  else {
    nextCard = siblings[index + 1];
  }

  modalCards[2].querySelector('.card-image').src =
    nextCard.querySelector('.card-image').src;
  modalCards[2].querySelector('.card-content-description').textContent =
    nextCard.querySelector('.card-content-description').textContent;


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


// Caroussel logic

modalPreviousButton.addEventListener('click', (e) => {
  const leftCard = document.querySelector('.modal .card:nth-of-type(1)');
  const centerCard = document.querySelector('.modal .card:nth-of-type(2)');
  const rightCard = document.querySelector('.modal .card:nth-of-type(3)');

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
    modalClose = document.querySelector('.modal .card:nth-of-type(2) .modal-close');
    editButton = document.querySelector('.modal .card:nth-of-type(2) .card-content-edit-button');

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

    // Ideally this would happen after 100ms, while the code from above after 200, but previousCard isn't defined in that case and I can't be bothered
    rightCard.querySelector('.card-image').src =
      previousCard.querySelector('img').src;
    rightCard.querySelector('.card-content-description').textContent =
      previousCard.querySelector('.card-content-description').textContent;

  }, animationDuration);
});

modalNextButton.addEventListener('click', (e) => {
  const leftCard = document.querySelector('.modal .card:nth-of-type(1)');
  const centerCard = document.querySelector('.modal .card:nth-of-type(2)');
  const rightCard = document.querySelector('.modal .card:nth-of-type(3)');

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
    modalClose = document.querySelector('.modal .card:nth-of-type(2) .modal-close');
    editButton = document.querySelector('.modal .card:nth-of-type(2) .card-content-edit-button');

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

    // Ideally this would happen after 100ms, while the code from above after 200, but nextCard isn't defined in that case and I can't be bothered
    leftCard.querySelector('.card-image').src =
      nextCard.querySelector('img').src;
    leftCard.querySelector('.card-content-description').textContent =
      nextCard.querySelector('.card-content-description').textContent;

  }, animationDuration);
});


const handleSliders = (e) => {
  const description = document.querySelector('.modal .card:nth-of-type(2) .card-content-description');
  const comments = document.querySelector('.modal .card:nth-of-type(2) .card-content-comments');

  if (
    description.style.display === 'none' ||
    comments.style.display === 'none'
  ) {
    document.querySelector('.modal .card:nth-of-type(2) .card-content-description').style.display = 'block';
    document.querySelector('.modal .card:nth-of-type(2) .card-content-comments').style.display = 'block';
    document.querySelector('.modal .card:nth-of-type(2) .card-content-edit').style.display = 'none';
  } else {
    document.querySelector('.modal .card:nth-of-type(2) .card-content-description').style.display = 'none';
    document.querySelector('.modal .card:nth-of-type(2) .card-content-comments').style.display = 'none';
    document.querySelector('.modal .card:nth-of-type(2) .card-content-edit').style.display = 'block';

  }
};
