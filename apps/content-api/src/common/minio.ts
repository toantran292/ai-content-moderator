import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as mime from 'mime-types';

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true, // bắt buộc với MinIO
});

const bucket = process.env.MINIO_BUCKET || 'uploads';

export async function uploadBuffer(buffer: Buffer, originalName: string) {
  const ext = mime.extension(originalName) || 'bin';
  const objectKey = `${Date.now()}-${randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: mime.lookup(ext) || 'application/octet-stream',
    }),
  );
  return objectKey; // trả về key để worker tải xuống
}

export async function getPresignedUrl(key: string, expires = 3600) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: expires },
  );
}