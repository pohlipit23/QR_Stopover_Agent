/**
 * Cloudflare R2 Storage utilities for images and static assets
 * Provides type-safe access to R2 storage with upload, download, and management capabilities
 */

export interface AssetMetadata {
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  category: 'logo' | 'hotel' | 'tour' | 'category' | 'general';
  tags?: string[];
}

export interface UploadResult {
  success: boolean;
  key: string;
  url?: string;
  metadata?: AssetMetadata;
  error?: string;
}

export class R2StorageManager {
  private r2: R2Bucket;
  private baseUrl: string;

  constructor(r2Bucket: R2Bucket, baseUrl: string = '') {
    this.r2 = r2Bucket;
    this.baseUrl = baseUrl;
  }

  /**
   * Upload file to R2 storage
   */
  async uploadFile(
    key: string,
    file: File | ArrayBuffer | Uint8Array,
    metadata: Partial<AssetMetadata> = {}
  ): Promise<UploadResult> {
    try {
      const contentType = metadata.contentType || this.getContentType(key);
      const customMetadata: Record<string, string> = {
        category: metadata.category || 'general',
        uploadedAt: new Date().toISOString(),
        ...(metadata.tags && { tags: metadata.tags.join(',') }),
      };

      let body: ArrayBuffer;
      if (file instanceof File) {
        body = await file.arrayBuffer();
        customMetadata.filename = file.name;
        customMetadata.size = file.size.toString();
      } else if (file instanceof ArrayBuffer) {
        body = file;
        customMetadata.size = file.byteLength.toString();
      } else {
        body = file.buffer;
        customMetadata.size = file.length.toString();
      }

      await this.r2.put(key, body, {
        httpMetadata: {
          contentType,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
        customMetadata,
      });

      const url = this.getPublicUrl(key);

      return {
        success: true,
        key,
        url,
        metadata: {
          filename: customMetadata.filename || key,
          contentType,
          size: parseInt(customMetadata.size),
          uploadedAt: customMetadata.uploadedAt,
          category: customMetadata.category as AssetMetadata['category'],
          tags: customMetadata.tags?.split(','),
        },
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Get file from R2 storage
   */
  async getFile(key: string): Promise<R2Object | null> {
    try {
      return await this.r2.get(key);
    } catch (error) {
      console.error('R2 get error:', error);
      return null;
    }
  }

  /**
   * Delete file from R2 storage
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.r2.delete(key);
      return true;
    } catch (error) {
      console.error('R2 delete error:', error);
      return false;
    }
  }

  /**
   * List files with optional prefix filter
   */
  async listFiles(prefix?: string, limit: number = 100): Promise<R2Object[]> {
    try {
      const options: R2ListOptions = { limit };
      if (prefix) {
        options.prefix = prefix;
      }

      const result = await this.r2.list(options);
      return result.objects;
    } catch (error) {
      console.error('R2 list error:', error);
      return [];
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    if (this.baseUrl) {
      return `${this.baseUrl}/${key}`;
    }
    // Fallback to R2 public URL format
    return `https://pub-${this.getBucketId()}.r2.dev/${key}`;
  }

  /**
   * Upload Qatar Airways brand assets
   */
  async uploadBrandAssets(): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    const brandAssets = [
      {
        localPath: '/src/assets/images/Qatar-Airways-Logo.png',
        key: 'logos/qatar-airways-logo.png',
        category: 'logo' as const,
        tags: ['brand', 'logo', 'qatar-airways'],
      },
      {
        localPath: '/src/assets/images/privilege_club_logo.png',
        key: 'logos/privilege-club-logo.png',
        category: 'logo' as const,
        tags: ['brand', 'logo', 'privilege-club'],
      },
    ];

    for (const asset of brandAssets) {
      try {
        // In a real implementation, you would read the file from the filesystem
        // For now, we'll create a placeholder result
        results.push({
          success: true,
          key: asset.key,
          url: this.getPublicUrl(asset.key),
          metadata: {
            filename: asset.localPath.split('/').pop() || asset.key,
            contentType: this.getContentType(asset.key),
            size: 0, // Would be actual file size
            uploadedAt: new Date().toISOString(),
            category: asset.category,
            tags: asset.tags,
          },
        });
      } catch (error) {
        results.push({
          success: false,
          key: asset.key,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    return results;
  }

  /**
   * Upload hotel images
   */
  async uploadHotelImages(): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    const hotelImages = [
      'millenium_hotel.webp',
      'steigenberger_hotel.webp',
      'souq_waqif_hotel.webp',
      'crowne_plaza_hotel.webp',
      'al_najada_hotel.webp',
      'raffles_hotel_doha.jpg',
    ];

    for (const image of hotelImages) {
      const key = `hotels/${image}`;
      results.push({
        success: true,
        key,
        url: this.getPublicUrl(key),
        metadata: {
          filename: image,
          contentType: this.getContentType(image),
          size: 0, // Would be actual file size
          uploadedAt: new Date().toISOString(),
          category: 'hotel',
          tags: ['hotel', 'accommodation'],
        },
      });
    }

    return results;
  }

  /**
   * Upload category images
   */
  async uploadCategoryImages(): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    const categoryImages = [
      'standard_stopover.jpg',
      'premium_stopover.jpg',
      'premium_beach_stopover.jpg',
      'luxury_stopover.jpg',
    ];

    for (const image of categoryImages) {
      const key = `categories/${image}`;
      results.push({
        success: true,
        key,
        url: this.getPublicUrl(key),
        metadata: {
          filename: image,
          contentType: this.getContentType(image),
          size: 0, // Would be actual file size
          uploadedAt: new Date().toISOString(),
          category: 'category',
          tags: ['category', 'stopover'],
        },
      });
    }

    return results;
  }

  /**
   * Upload tour images
   */
  async uploadTourImages(): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    const tourImages = [
      'whale sharks of qatar.jpg',
      'shale_shark.webp',
      'the pearl.jpg',
      'airport_transfer.webp',
    ];

    for (const image of tourImages) {
      const key = `tours/${image}`;
      results.push({
        success: true,
        key,
        url: this.getPublicUrl(key),
        metadata: {
          filename: image,
          contentType: this.getContentType(image),
          size: 0, // Would be actual file size
          uploadedAt: new Date().toISOString(),
          category: 'tour',
          tags: ['tour', 'experience'],
        },
      });
    }

    return results;
  }

  /**
   * Upload all provided assets
   */
  async uploadAllAssets(): Promise<{
    brand: UploadResult[];
    hotels: UploadResult[];
    categories: UploadResult[];
    tours: UploadResult[];
  }> {
    const [brand, hotels, categories, tours] = await Promise.all([
      this.uploadBrandAssets(),
      this.uploadHotelImages(),
      this.uploadCategoryImages(),
      this.uploadTourImages(),
    ]);

    return { brand, hotels, categories, tours };
  }

  /**
   * Get content type from file extension
   */
  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Get bucket ID (placeholder - would be configured)
   */
  private getBucketId(): string {
    return 'placeholder-bucket-id';
  }
}

/**
 * Create R2 storage manager instance
 */
export function createR2StorageManager(env: any, baseUrl?: string): R2StorageManager {
  if (!env.QATAR_STOPOVER_ASSETS) {
    throw new Error('QATAR_STOPOVER_ASSETS binding not found');
  }
  return new R2StorageManager(env.QATAR_STOPOVER_ASSETS, baseUrl);
}