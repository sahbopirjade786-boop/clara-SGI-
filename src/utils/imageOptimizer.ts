/**
 * Clara Multimodal Image Processor & Optimizer
 * Compresses and safely resizes user photos on the client side
 * to prevent memory exhaustion, network timeouts, and 413 Payload Too Large errors.
 */

export interface ProcessedImage {
  base64: string;
  mimeType: string;
  fileName: string;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
}

export async function processAndOptimizeImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // Basic file type validation
    if (!file.type || !file.type.startsWith('image/')) {
      // Check if it's an SVG or common image extension even if mimeType is generic
      const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp'];
      const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
      if (!hasValidExt) {
        reject(new Error(`The selected file "${file.name}" is not a supported image format. Please select a PNG, JPG, WEBP, or SVG.`));
        return;
      }
    }

    // For SVG images, read directly as data URL without canvas resizing
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          base64: result,
          mimeType: 'image/svg+xml',
          fileName: file.name,
          previewUrl: result,
          originalSize: file.size,
          compressedSize: file.size,
        });
      };
      reader.onerror = () => {
        reject(new Error('Device storage read error while accessing the selected SVG file.'));
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error('Permission or storage access denied while reading media file from gallery.'));
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('The image file could not be decoded. It may be corrupted or an unsupported format.'));
      };

      img.onload = () => {
        try {
          const maxDimension = 1600; // Optimal resolution for Gemini Multimodal Vision
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to raw reader result if canvas 2d context fails
            const rawResult = reader.result as string;
            resolve({
              base64: rawResult,
              mimeType: file.type || 'image/jpeg',
              fileName: file.name,
              previewUrl: rawResult,
              originalSize: file.size,
              compressedSize: file.size,
            });
            return;
          }

          // Draw image to canvas for compression
          ctx.drawImage(img, 0, 0, width, height);

          // Export as clean JPEG with high fidelity quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve({
            base64: compressedDataUrl,
            mimeType: 'image/jpeg',
            fileName: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
            previewUrl: compressedDataUrl,
            originalSize: file.size,
            compressedSize: Math.round((compressedDataUrl.length * 3) / 4),
          });
        } catch (err: any) {
          // Fallback to raw data url if canvas security or memory exception occurs
          const rawResult = reader.result as string;
          resolve({
            base64: rawResult,
            mimeType: file.type || 'image/jpeg',
            fileName: file.name,
            previewUrl: rawResult,
            originalSize: file.size,
            compressedSize: file.size,
          });
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
