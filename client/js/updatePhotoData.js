const updatePhotoData = async (card, id) => {
    const comments = await getCommentsFromDB(id, 1);
    //const likes = await getUpdatedLikes(id);
    const likes = 0;


    // Reset likes counter
    const likesSection = card.querySelector('.card-content-like span');
    likesSection.innerHTML = likes;

    // Reset comments
    updateComments(card, comments);
}

export default updatePhotoData;