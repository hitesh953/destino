/**
 * Palm Image Compressor
 * Compresses and optimizes palm images for AI analysis
 *
 * Goals:
 * - Reduce file size (faster upload to API)
 * - Preserve palm line details (2048px max dimension)
 * - Maintain aspect ratio
 * - 85% JPEG quality (good balance)
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

interface CompressionOptions {
  maxDimension?: number; // Default: 2048
  quality?: number; // Default: 0.85 (85%)
  format?: 'jpeg' | 'png'; // Default: 'jpeg'
}

interface CompressionResult {
  uri: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compress palm image for API upload
 *
 * @param imageUri - Original image URI
 * @param options - Compression options
 * @returns Compressed image details
 *
 * @example
 * const compressed = await compressPalmImage('file:///path/to/image.jpg');
 * console.log(`Reduced from ${compressed.originalSize} to ${compressed.compressedSize} bytes`);
 */
export async function compressPalmImage(
  imageUri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const maxDimension = options.maxDimension || 2048;
  const quality = options.quality || 0.85;
  const format = options.format || 'jpeg';

  try {
    console.log('📦 [COMPRESS] Starting image compression...');
    console.log(`📦 [COMPRESS] Input: ${imageUri}`);

    // Step 1: Get original image info
    console.log('📊 [COMPRESS] Analyzing original image...');
    const imageInfo = await ImageManipulator.manipulateAsync(imageUri, [], {
      compress: 1,
      format: 'jpeg',
    });

    console.log(`📊 [COMPRESS] Original dimensions: ${imageInfo.width}x${imageInfo.height}`);

    // Step 2: Calculate new dimensions while preserving aspect ratio
    const aspectRatio = imageInfo.width / imageInfo.height;
    let newWidth = imageInfo.width;
    let newHeight = imageInfo.height;

    if (imageInfo.width > imageInfo.height) {
      // Width is longer
      if (imageInfo.width > maxDimension) {
        newWidth = maxDimension;
        newHeight = Math.round(maxDimension / aspectRatio);
      }
    } else {
      // Height is longer
      if (imageInfo.height > maxDimension) {
        newHeight = maxDimension;
        newWidth = Math.round(maxDimension * aspectRatio);
      }
    }

    console.log(`📏 [COMPRESS] Resizing to: ${newWidth}x${newHeight}`);
    console.log(`📏 [COMPRESS] Aspect ratio maintained: ${aspectRatio.toFixed(2)}`);

    // Step 3: Resize and compress
    console.log(`⚙️  [COMPRESS] Compressing with ${Math.round(quality * 100)}% quality...`);
    const compressed = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: newWidth,
            height: newHeight,
          },
        },
      ],
      {
        compress: quality,
        format: format as any,
      }
    );

    console.log(`✅ [COMPRESS] Compression complete: ${compressed.uri}`);

    // Step 4: Get file sizes
    const originalFileInfo = await FileSystem.getInfoAsync(imageUri);
    const compressedFileInfo = await FileSystem.getInfoAsync(compressed.uri);

    const originalSize = originalFileInfo.size || 0;
    const compressedSize = compressedFileInfo.size || 0;
    const compressionRatio = originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0;

    console.log(`📉 [COMPRESS] Original size: ${formatBytes(originalSize)}`);
    console.log(`📉 [COMPRESS] Compressed size: ${formatBytes(compressedSize)}`);
    console.log(`📉 [COMPRESS] Reduction: ${compressionRatio.toFixed(1)}%`);

    return {
      uri: compressed.uri,
      width: newWidth,
      height: newHeight,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('❌ [COMPRESS] Error compressing image:', error);
    throw new Error(`Failed to compress image: ${(error as Error).message}`);
  }
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get compression statistics for comparison
 */
export async function getCompressionStats(
  imageUri: string
): Promise<{ original: string; compressed: string; ratio: string }> {
  try {
    const original = await FileSystem.getInfoAsync(imageUri);
    const compressed = await compressPalmImage(imageUri);

    return {
      original: formatBytes(compressed.originalSize),
      compressed: formatBytes(compressed.compressedSize),
      ratio: `${compressed.compressionRatio.toFixed(1)}% reduction`,
    };
  } catch (error) {
    console.error('Error getting compression stats:', error);
    return {
      original: 'N/A',
      compressed: 'N/A',
      ratio: 'N/A',
    };
  }
}

export default {
  compressPalmImage,
  getCompressionStats,
};
