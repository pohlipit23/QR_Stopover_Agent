/**
 * Tests for Cloudflare data services integration
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createErrorHandler } from '../lib/cloudflare/error-handling';
import { getAssetManager } from '../lib/cloudflare/asset-manager';

describe('Cloudflare Data Services', () => {
  describe('Error Handler', () => {
    let errorHandler: any;

    beforeEach(() => {
      errorHandler = createErrorHandler();
    });

    it('should create error handler with default config', () => {
      expect(errorHandler).toBeDefined();
    });

    it('should execute operation with retry logic', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      const result = await errorHandler.executeWithRetry(
        mockOperation,
        'kv',
        'test-operation'
      );

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should use fallback on operation failure', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Test error'));
      const fallbackValue = 'fallback-result';
      
      const result = await errorHandler.executeWithRetry(
        mockOperation,
        'kv',
        'test-operation',
        fallbackValue
      );

      expect(result).toBe(fallbackValue);
    });

    it('should track error statistics', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Test error'));
      
      try {
        await errorHandler.executeWithRetry(
          mockOperation,
          'kv',
          'test-operation'
        );
      } catch (error) {
        // Expected to fail
      }

      const stats = errorHandler.getErrorStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byService.kv).toBeGreaterThan(0);
    });
  });

  describe('Asset Manager', () => {
    let assetManager: any;

    beforeEach(() => {
      assetManager = getAssetManager();
    });

    it('should provide asset URLs', () => {
      const assetUrls = assetManager.getAssetUrls();
      
      expect(assetUrls).toBeDefined();
      expect(assetUrls.brand).toBeDefined();
      expect(assetUrls.hotels).toBeDefined();
      expect(assetUrls.categories).toBeDefined();
      expect(assetUrls.tours).toBeDefined();
    });

    it('should provide brand logos', () => {
      const logos = assetManager.getBrandLogos();
      
      expect(logos.qatarAirways).toBeDefined();
      expect(logos.privilegeClub).toBeDefined();
      expect(logos.qatarAirways).toContain('Qatar-Airways-Logo.png');
    });

    it('should provide hotel images', () => {
      const hotelImages = assetManager.getHotelImages();
      
      expect(hotelImages.millennium).toBeDefined();
      expect(hotelImages.steigenberger).toBeDefined();
      expect(hotelImages.souqWaqif).toBeDefined();
      expect(hotelImages.crownePlaza).toBeDefined();
      expect(hotelImages.alNajada).toBeDefined();
    });

    it('should provide category images', () => {
      const categoryImages = assetManager.getCategoryImages();
      
      expect(categoryImages.standard).toBeDefined();
      expect(categoryImages.premium).toBeDefined();
      expect(categoryImages.premiumBeach).toBeDefined();
      expect(categoryImages.luxury).toBeDefined();
    });

    it('should provide tour images', () => {
      const tourImages = assetManager.getTourImages();
      
      expect(tourImages.whaleSharks).toBeDefined();
      expect(tourImages.shaleShark).toBeDefined();
      expect(tourImages.thePearl).toBeDefined();
      expect(tourImages.airportTransfer).toBeDefined();
    });

    it('should get specific asset URL', () => {
      const logoUrl = assetManager.getAssetUrl('brand', 'qatarAirways');
      expect(logoUrl).toBeDefined();
      expect(logoUrl).toContain('Qatar-Airways-Logo.png');
    });

    it('should generate optimized image URLs', () => {
      const optimizedUrl = assetManager.getOptimizedImageUrl('hotels', 'millennium', {
        width: 300,
        height: 200,
        quality: 80,
        format: 'webp'
      });
      
      expect(optimizedUrl).toBeDefined();
      expect(optimizedUrl).toContain('millenium_hotel.webp');
    });
  });

  describe('Data Services Integration', () => {
    it('should handle missing Cloudflare bindings gracefully', () => {
      // Test that the application doesn't crash when Cloudflare bindings are not available
      expect(() => {
        // This would normally throw in production without proper bindings
        // But our error handling should provide fallbacks
        const assetManager = getAssetManager();
        const urls = assetManager.getAssetUrls();
        expect(urls).toBeDefined();
      }).not.toThrow();
    });

    it('should provide fallback asset URLs', () => {
      const assetManager = getAssetManager(false); // Force local assets
      const urls = assetManager.getAssetUrls();
      
      // All URLs should point to local assets
      expect(urls.brand.qatarAirways).toContain('/src/assets/images/');
      expect(urls.hotels.millennium).toContain('/src/assets/images/');
      expect(urls.categories.standard).toContain('/src/assets/images/');
      expect(urls.tours.whaleSharks).toContain('/src/assets/images/');
    });
  });
});