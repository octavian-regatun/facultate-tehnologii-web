const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');


if (userId) {
    fetch(`http://localhost:8081/photo/${userId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    })
        .then(response => response.json())
        .then(photo => {
            const cardImage = document.createElement("img");
            cardImage.classList.add("card-image");
            cardImage.src = `data:image/png;base64,${photo.binaryString}`;
            cardImage.setAttribute("photo-id", photo.id);

            const imgContainer = document.querySelector(".img");
            if (imgContainer) {
                imgContainer.appendChild(cardImage);
            }

            displayExif(photo.exif);

            const animationSelect = document.getElementById("animation-select");
            const durationSelect = document.getElementById("duration-select");

            const applyAnimation = () => {
                const animationType = animationSelect.value;
                const duration = durationSelect.value;

                if (animationType === 'none') {
                    cardImage.style.animation = 'none';
                } else {
                    cardImage.style.animation = `${animationType} ${duration}s linear infinite`;
                }
            };

            animationSelect.addEventListener("change", applyAnimation);
            durationSelect.addEventListener("change", applyAnimation);
        })
        .catch(error => {
            console.error("Error fetching photo:", error);
        });
} else {
    console.error("photo ID not found in the URL");
}

function displayExif(exif) {
    const exifContainer = document.getElementById("exif-data");
    exifContainer.innerHTML = '';

    if (exif) {
        const parsedExif = JSON.parse(exif);
        if (Object.keys(parsedExif).length > 0) {
            const grid = document.createElement("div");
            grid.classList.add("exif-grid");
            for (const [key, value] of Object.entries(parsedExif)) {
                const keyCell = document.createElement("div");
                const valueCell = document.createElement("div");

                keyCell.textContent = key;
                valueCell.textContent = value;

                grid.appendChild(keyCell);
                grid.appendChild(valueCell);
            }
            exifContainer.appendChild(grid);
        } else {
            exifContainer.textContent = "No EXIF data found.";
        }
    } else {
        exifContainer.textContent = "No EXIF data found.";
    }
}