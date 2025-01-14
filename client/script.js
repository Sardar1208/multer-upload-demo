const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const statusDiv = document.getElementById("status");
const previewDiv = document.getElementById("preview");
const heading = document.getElementById("heading");
const container = document.querySelector(".container");

uploadButton.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
        statusDiv.textContent = "Please select a file to upload.";
        return;
    }

    // Display the preview for images
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewDiv.style.display = "block";
            previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
        });

        console.log("res: ", response)

        if (response.ok) {
            const text = await response.text();

            // Remove upload elements and show success UI
            heading.style.display = "none";
            fileInput.style.display = "none";
            uploadButton.style.display = "none";
            previewDiv.style.display = "none";

            statusDiv.innerHTML = `
                <img src="./images/tick.png" class="tick" alt="Success">
                <p>File uploaded successfully.</p>
                <button id="uploadAnotherButton" class="upload-another">Upload Another Image</button>
            `;

            statusDiv.style.color = "green";

            // Add event listener for "Upload Another" button
            document
                .getElementById("uploadAnotherButton")
                .addEventListener("click", () => {
                    location.reload();
                });
        } else {
            // Handle error response from the server
            const errorText = await response.text();

            // Remove upload elements and show success UI
            heading.style.display = "none";
            fileInput.style.display = "none";
            uploadButton.style.display = "none";
            previewDiv.style.display = "none";

            statusDiv.innerHTML = `
                <img src="./images/cross.png" class="tick" alt="Success">
                <p>${errorText}</p>
                <button id="uploadAnotherButton" class="upload-another">Upload Another Image</button>
            `;

            statusDiv.style.color = "red";

            document
                .getElementById("uploadAnotherButton")
                .addEventListener("click", () => {
                    location.reload();
                });
        }
    } catch (error) {
        console.log("error: ", error);
        // Remove upload elements and show success UI
        heading.style.display = "none";
        fileInput.style.display = "none";
        uploadButton.style.display = "none";
        previewDiv.style.display = "none";

        statusDiv.innerHTML = `
            <img src="./images/cross.png" class="tick" alt="Error">
            <p>An error occurred: ${error.message}</p>
        `;
    }
});
