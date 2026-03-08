import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.S3_BUCKET ?? 'infographic-studio';
const REGION = process.env.AWS_REGION ?? 'us-east-1';

function getClient(): S3Client {
  const endpoint = process.env.S3_ENDPOINT; // e.g. http://localstack:4566
  return new S3Client({
    region: REGION,
    ...(endpoint && {
      endpoint,
      forcePathStyle: true, // required for LocalStack
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'test',
      },
    }),
  });
}

/**
 * Fetch an image from a remote URL and store it in S3/LocalStack.
 * Returns the S3 key.
 */
export async function storeImage(remoteUrl: string, key: string): Promise<string> {
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to fetch image from KIE: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') ?? 'image/png';

  await getClient().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  console.log(`[storage] Stored ${key} in s3://${BUCKET}`);
  return key;
}

/**
 * Get a pre-signed URL for an S3 object (valid 1 hour).
 * Used when S3_ENDPOINT is set (LocalStack / private bucket).
 */
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}

/**
 * Stream an S3 object — used by the download proxy route.
 */
export async function getObjectStream(key: string): Promise<{ body: ReadableStream; contentType: string }> {
  const res = await getClient().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  if (!res.Body) throw new Error(`Object ${key} not found in S3`);
  return {
    body: res.Body.transformToWebStream(),
    contentType: res.ContentType ?? 'image/png',
  };
}
