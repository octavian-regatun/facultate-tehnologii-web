const updateComments = async (card, comments, reset = true) => {
    const commentsSection = card.querySelector('.card-content-comments');

    const noImgs = card.querySelector('.no-comms-msg');
    if (noImgs) {
        noImgs.remove();
    }

    if (reset) {
        const comms = card.querySelectorAll('.card-content-comment');
        comms.forEach(comm => comm.remove());
    }

    // Comments will be inserted BEFORE the import/export buttons
    let buttonsContainer = commentsSection.querySelector('.filter-btn-container');

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
            commentsSection.insertBefore(commentDiv, buttonsContainer);
        });
    } else {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("no-comms-msg");
        const commentText = document.createElement("p");
        commentText.textContent = "There are no comments";
        commentDiv.appendChild(commentText);
        commentsSection.insertBefore(commentDiv, buttonsContainer);
    }
}