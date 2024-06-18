const importComments = async (card, id) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv, .json';

    fileInput.click();

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            const content = e.target.result;
            const extension = file.name.split('.').pop().toLowerCase();

            let comments = [];
            if (extension === 'csv') {
                comments = parseCSV(content);
            } else if (extension === 'json') {
                comments = JSON.parse(content);
            } else {
                console.error('Wrong file extension - should be .csv or .json:', extension);
                return;
            }

            await postComments(card, id, comments);
        };
        reader.readAsText(file);
    });
};

const parseCSV = (content) => {
    const lines = content.trim().split('\n');
    return lines.map(line => {
        const [author, content, timestamp] = line.split(',');
        return { author, content, timestamp };
    });
};

const postComments = async (card, id, comments) => {
    try {
        const response = await fetch(`http://localhost:8081/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(comments.map(comment => ({
                photoId: parseInt(id, 10),
                author: comment.author,
                content: comment.content,
                timestamp: new Date(comment.timestamp).toISOString()
            }))),
        });

        if (response.ok) {
            const updatedComments = await response.json();
            updateComments(card, updatedComments, false);
        } else {
            const error = await response.text();
            console.error("Failed to post comments:", error);
        }
    } catch (error) {
        console.error("Error posting comments:", error);
    }
};

export default importComments;
