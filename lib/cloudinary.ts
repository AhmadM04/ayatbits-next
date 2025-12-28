import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

/**
 * Lazy configuration of Cloudinary
 */
function ensureConfigured() {
  if (!isConfigured) {
    // Provide defaults to prevent build-time errors
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'placeholder',
      api_key: process.env.CLOUDINARY_API_KEY || 'placeholder',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder',
    });
    isConfigured = true;
  }
  
  // Validate configuration when actually used
  if (!process.env.CLOUDINARY_API_KEY || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials are not configured');
  }
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: File | Buffer | string,
  folder: string = 'ayatbits',
  options?: {
    publicId?: string;
    transformation?: any;
  }
): Promise<{ secure_url: string; public_id: string }> {
  ensureConfigured();
  try {
    const uploadOptions: any = {
      folder,
      ...(options?.publicId && { public_id: options.publicId }),
      ...(options?.transformation && { transformation: options.transformation }),
    };

    let result: any;
    if (typeof file === 'string') {
      // URL upload
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else if (file instanceof File) {
      // File upload - convert to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(uploadOptions, (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }).end(buffer);
      });
    } else {
      // Buffer upload
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(uploadOptions, (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }).end(file);
      });
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Get optimized image URL from Cloudinary
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string {
  const transformations: string[] = [];

  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.format) transformations.push(`f_${options.format}`);

  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}${publicId}`;
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

