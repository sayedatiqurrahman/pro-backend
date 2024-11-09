import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // Replace spaces with underscores
        const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
        cb(null, sanitizedFilename);

        // Update file's path property to reflect the sanitized name
        file.path = `./public/temp/${sanitizedFilename}`;
    }
});


export const upload = multer({ storage })