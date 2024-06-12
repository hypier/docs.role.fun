import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export const getUploadUrl = async (filename: string) => {
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `${Math.random().toString(36).substring(2, 15)}${filename.substring(
      filename.lastIndexOf("."),
    )}`,
  };

  const command = new PutObjectCommand(params);

  console.log("getUploadUrl params", params, process.env.R2_BUCKET_NAME, process.env.R2_ENDPOINT);
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60,
  });
  return signedUrl;
};

export const deleteImage = async (imageUrl: string) => {
  const urlParts = imageUrl.split("/");
  const filename = urlParts[urlParts.length - 1];
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filename,
  };
  const command = new DeleteObjectCommand(params);
  await s3Client.send(command);
};
