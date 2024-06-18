// 1: .csv file
const convertToCSV = (comments) => {
    const headers = ["Id", "PhotoId", "Author", "Comment", "Timestamp"];
    const rows = comments.map(comment => [comment.id, comment.photoId, comment.author, comment.content, comment.timestamp]);

    let csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

    return csvContent;
};

// 2: .json file
const convertToJSON = (comments) => {
    return JSON.stringify(comments, null, 2);
};



const exportComments = async (id) => {
    const comments = await getCommentsFromDB(id);

    const zip = new JSZip();

    zip.file("comments.csv", convertToCSV(comments));
    zip.file("comments.json", convertToJSON(comments));

    // .zip file
    zip.generateAsync({ type: "blob" })
        .then((content) => {
            const downloadLink = document.createElement('a');
            const url = URL.createObjectURL(content);
            downloadLink.href = url;
            downloadLink.download = 'comments.zip';
            downloadLink.click();

            URL.revokeObjectURL(url);
        });

};

export default exportComments;