import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

/**
 * Generate a presigned URL for uploading a file to S3
 * @param fileName Original file name
 * @param fileType MIME type of the file
 * @param folder Folder path in S3 bucket
 * @returns Object with upload URL and the final S3 key
 */
export async function generateUploadUrl(fileName: string, fileType: string, folder: string = 'uploads'): Promise<{ uploadUrl: string; key: string }> {
  // Create a unique file name to prevent overwriting
  const fileExtension = fileName.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  
  // Create the S3 key (path)
  const key = `${folder}/${uniqueFileName}`;
  
  // Create the command to put an object in S3
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });
  
  // Generate a presigned URL for uploading
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  
  return {
    uploadUrl,
    key,
  };
}

/**
 * Generate a presigned URL for downloading/viewing a file from S3
 * @param key S3 object key
 * @returns Presigned URL for downloading/viewing
 */
export async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  // Generate a presigned URL for downloading
  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  
  return downloadUrl;
}

/**
 * Delete a file from S3
 * @param key S3 object key
 * @returns Success status
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
}

/**
 * Get the public URL for a file in S3
 * @param key S3 object key
 * @returns Public URL
 */
export function getPublicUrl(key: string): string {
  // If using CloudFront, use the CloudFront domain
  if (process.env.CLOUDFRONT_DOMAIN) {
    return `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
  }
  
  // Otherwise, use the S3 bucket URL
  return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

/**
 * Generate a folder path for course content
 * @param courseId Course ID
 * @param moduleId Optional module ID
 * @param lessonId Optional lesson ID
 * @returns Folder path
 */
export function generateCoursePath(courseId: string, moduleId?: string, lessonId?: string): string {
  let path = `courses/${courseId}`;
  
  if (moduleId) {
    path += `/${moduleId}`;
    
    if (lessonId) {
      path += `/${lessonId}`;
    }
  }
  
  return path;
}
