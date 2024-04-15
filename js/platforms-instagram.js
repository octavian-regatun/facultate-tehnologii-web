const cards = document.querySelectorAll('.card');
const modal = document.querySelector('dialog');
const modalClose = document.querySelector('.modal-close');
const modalPreviousButton = document.querySelector('.modal-previous-button');
const modalNextButton = document.querySelector('.modal-next-button');
const editButton = document.querySelector('.card-content-edit-button');

let clickedCard;

modalClose.addEventListener('click', (e) => {
  modal.close();
  e.stopPropagation();
});

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

const updateModal = (e) => {
  clickedCard = e.target.closest('.card');
  const imageSrc = clickedCard.querySelector('img').src;
  const description = clickedCard.querySelector(
    '.card-content-description'
  ).textContent;

  modal.querySelector('.card-image').src = imageSrc;
  modal.querySelector('.card-content-description').textContent = description;

  modal.showModal();
};

const handleClick = (e) => {
  updateModal(e);
};

for (const card of cards) {
  card.addEventListener('click', (e) => {
    if (e.ctrlKey) {
      handleCtrlClick(e);
    } else {
      handleClick(e);
    }
  });
}

modalPreviousButton.addEventListener('click', (e) => {
  const previousCard = clickedCard.previousElementSibling;

  if (!previousCard) return;

  modal.querySelector('.card-image').src =
    previousCard.querySelector('img').src;
  modal.querySelector('.card-content-description').textContent =
    previousCard.querySelector('.card-content-description').textContent;

  clickedCard = previousCard;
});

modalNextButton.addEventListener('click', (e) => {
  const nextCard = clickedCard.nextElementSibling;

  if (!nextCard) return;

  modal.querySelector('.card-image').src = nextCard.querySelector('img').src;
  modal.querySelector('.card-content-description').textContent =
    nextCard.querySelector('.card-content-description').textContent;

  clickedCard = nextCard;
});

editButton.addEventListener('click', (e) => {
  const description = document.querySelector('.card-content-description');
  const comments = document.querySelector('.card-content-comments');

  if (
    description.style.display === 'none' ||
    comments.style.display === 'none'
  ) {
    document.querySelector('.card-content-description').style.display = 'block';
    document.querySelector('.card-content-comments').style.display = 'block';
    document.querySelector('.card-content-edit').style.display = 'none';
  } else {
    document.querySelector('.card-content-description').style.display = 'none';
    document.querySelector('.card-content-comments').style.display = 'none';
    document.querySelector('.card-content-edit').style.display = 'block';

  }
});
