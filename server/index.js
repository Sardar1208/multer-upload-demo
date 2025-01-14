const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const allowedFileTypes = ["image/png", "image/jpeg", "application/pdf"];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = path.join(
            __dirname,
            "uploads",
            file.mimetype.split("/")[1]
        );

        fs.mkdirSync(folder, { recursive: true });

        cb(null, folder);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 }, // 5 KB size limit
    fileFilter: (req, file, cb) => {
        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            req.fileValidationError = "Forbidden extension";
            return cb(null, false, req.fileValidationError);
        }
    },
});

const app = express();

app.use(cors());

app.post("/upload", upload.single("file"), (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).send("Incorrect file type");
    }

    if (req.error && req.error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send("File size is too large. Please upload a smaller file.");
    }

    const file = req.file;
    console.log("Received file:", file);
    if (!file) {
        return res.status(400).send("No file uploaded!");
    }
    res.send(`File uploaded successfully: ${file.originalname}`);
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).send("File size is too large. Please upload a smaller file.");
        }
    } else if (err.message === "Incorrect file type") {
        return res.status(400).send("Incorrect file type. Allowed types are: image/png, image/jpeg, application/pdf.");
    } else if (err.message === "No file uploaded") {
        return res.status(400).send("No file uploaded!");
    }

    return res.status(500).send("Something went wrong during the file upload.");
});

app.listen(3000, () => console.log("Server started on port 3000"));
