import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// ============================================
// Cloudflare R2 Client Configuration
// ============================================

// Environment variables (set in .env.local)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'nuvaclub-issues'
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL

// R2 endpoint URL
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

// Initialize S3 client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique object key for an image
 * Format: issue-screenshot/{year}/{month}/{uuid}-{filename}
 */
export function generateObjectKey(filename: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const uuid = crypto.randomUUID()

  // Sanitize filename
  const sanitizedFilename = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100)

  return `issue-screenshot/${year}/${month}/${uuid}-${sanitizedFilename}`
}

/**
 * Get the public URL for an object
 * Uses R2_PUBLIC_BASE_URL if configured (for public bucket)
 * Otherwise returns null (use presigned GET URL)
 */
export function getPublicUrl(objectKey: string): string | null {
  if (R2_PUBLIC_BASE_URL) {
    return `${R2_PUBLIC_BASE_URL}/${objectKey}`
  }
  return null
}

// ============================================
// R2 Operations
// ============================================

/**
 * Generate a presigned URL for uploading an image
 * @param objectKey - The key where the object will be stored
 * @param contentType - The MIME type of the file
 * @param expiresIn - URL expiration in seconds (default 15 minutes)
 */
export async function generatePresignedPutUrl(
  objectKey: string,
  contentType: string,
  expiresIn: number = 900 // 15 minutes
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
    ContentType: contentType,
  })

  const url = await getSignedUrl(r2Client, command, { expiresIn })
  return url
}

/**
 * Generate a presigned URL for downloading an image
 * Use this if the bucket is not public
 * @param objectKey - The key of the object to download
 * @param expiresIn - URL expiration in seconds (default 1 hour)
 */
export async function generatePresignedGetUrl(
  objectKey: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  })

  const url = await getSignedUrl(r2Client, command, { expiresIn })
  return url
}

/**
 * Delete an object from R2
 * @param objectKey - The key of the object to delete
 */
export async function deleteObject(objectKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  })

  await r2Client.send(command)
}

/**
 * Delete multiple objects from R2
 * @param objectKeys - Array of keys to delete
 */
export async function deleteObjects(objectKeys: string[]): Promise<void> {
  // R2 doesn't support bulk delete via S3 API, so delete one by one
  await Promise.all(objectKeys.map((key) => deleteObject(key)))
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate if a content type is allowed for upload
 */
export function isAllowedContentType(contentType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return allowedTypes.includes(contentType)
}

/**
 * Validate if a file size is within limits
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes (default 10MB)
 */
export function isAllowedFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize
}

/**
 * Validate file extension from filename
 */
export function hasAllowedExtension(filename: string): boolean {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return allowedExtensions.includes(ext)
}

// ============================================
// Export Client for Advanced Usage
// ============================================

export { r2Client, R2_BUCKET_NAME }
