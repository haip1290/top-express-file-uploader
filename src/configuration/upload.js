// UPLOADING FILE CONFIGURATION
const multer = require("multer");
const path = require("path");

const { createReadStream } = require("fs");

// superbase
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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
const uploadLocal = multer({
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

// SUPERBASE setup
const client = new S3Client({
  forcePathStyle: true,
  region: process.env.SUPERBASE_REGION,
  endpoint: process.env.SUPERBASE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPERBASE_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPERBASE_SECRET_ACCESS_KEY,
  },
});

// upload file to superbase storage
const uploadSuperbase = async ({ path, filename, mimetype }) => {
  const fileStream = createReadStream(path);

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.SUPERBASE_BUCKET,
    Key: filename,
    Body: fileStream,
    ContentType: mimetype,
  });

  await client.send(uploadCommand);
};

module.exports = { uploadLocal, uploadSuperbase };
