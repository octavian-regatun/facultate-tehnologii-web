const updatePhotoData = async (card, id) => {
    const comments = await getCommentsFromDB(id, 1);
    //const likes = await getUpdatedLikes(id);
    const likes = 0;


    // Reset likes counter
    const likesSection = card.querySelector('.card-content-like span');
    likesSection.innerHTML = likes;

    // Reset comments
    const commentsSection = card.querySelector('.card-content-comments');
    commentsSection.innerHTML = ""; // reset
    const commentsTitle = document.createElement("p");
    commentsTitle.textContent = "Comments";
    commentsSection.appendChild(commentsTitle);

    if (comments && comments.length) {
        comments.forEach(comment => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("card-content-comment");
            const commentIcon = document.createElement("p");
            commentIcon.textContent = comment.author;
            const commentText = document.createElement("p");
            commentText.textContent = comment.content;
            commentDiv.appendChild(commentIcon);
            commentDiv.appendChild(commentText);
            commentsSection.appendChild(commentDiv);
        });
    } else {
        const commentDiv = document.createElement("div");
        const commentText = document.createElement("p");
        commentText.textContent = "There are no comments";
        commentDiv.appendChild(commentText);
        commentsSection.appendChild(commentDiv);
    }
}

export default updatePhotoData;