// UPLOADING FILE CONFIGURATION
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random());
    const filename =
      file.fieldname + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1025 * 1024 }, // limit to 5mb
  fileFilter: (req, file, cb) => {
    // validate media type
    const filetypes = /^text\/plain|image\/(jpeg|png|gif)$/;
    const mimetype = filetypes.test(file.mimetype);

    // validate file ext
    const allowedExt = [".txt", ".jpeg", ".png", ".gif"];
    const fileExt = path.extname(file.originalname).toLowerCase();
    const isAllowed = allowedExt.includes(fileExt);

    if (mimetype && isAllowed) {
      return cb(null, true);
    }
    cb(new Error("File support only " + filetypes), false);
  },
});

module.exports = upload;
