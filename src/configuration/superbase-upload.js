const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

const upload = async () => {
  const file = fs.createReadStream("path/to/file");

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.SUPERBASE_BUCKET,
    Key: "path/to/file",
    Body: file,
    ContentType: "text",
  });

  await client.send(uploadCommand);
};

module.exports = upload;
