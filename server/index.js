const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Allowed file types
const allowedFileTypes = ["image/png", "image/jpeg", "application/pdf"];

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Get the file's MIME type and derive its folder
        const folder = path.join(
            __dirname,
            "uploads",
            file.mimetype.split("/")[1] // E.g., 'pdf', 'png', 'jpeg'
        );

        // Ensure the folder exists
        fs.mkdirSync(folder, { recursive: true });

        cb(null, folder);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Preserve original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// Set file filter and size limit
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB size limit
    fileFilter: (req, file, cb) => {
        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.log("here");
            req.fileValidationError = "Forbidden extension";
            return cb(null, false, req.fileValidationError);
        }
    },
});

// Initialize Express app
const app = express();

app.use(cors());

app.post("/upload", upload.single("file"), (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).send("Incorrect file type");
    }
    const file = req.file;
    console.log("Received file:", file);
    if (!file) {
        return res.status(400).send("No file uploaded!");
    }
    res.send(`File uploaded successfully: ${file.originalname}`);
});

// Start the server
app.listen(3000, () => console.log("Server started on port 3000"));
