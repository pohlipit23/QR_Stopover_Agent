/**
 * Asset manager for Cloudflare R2 storage with local fallbacks
 * Provides unified access to images and static assets
 */

export interface AssetUrls {
  brand: {
    qatarAirways: string;
    privilegeClub: string;
  };
  hotels: {
    millennium: string;
    steigenberger: string;
    souqWaqif: string;
    crownePlaza: string;
    alNajada: string;
    raffles: string;
  };
  categories: {
    standard: string;
    premium: string;
    premiumBeach: string;
    luxury: string;
  };
  tours: {
    whaleSharks: string;
    shaleShark: string;
    thePearl: string;
    airportTransfer: string;
  };
  general: {
    heroImage: string;
    stopoverProgram: string;
    planeSkyline: string;
  };
}

export class AssetManager {
  private assetUrls: AssetUrls;
  private useR2: boolean;
  private r2BaseUrl: string;

  constructor(useR2: boolean = false, r2BaseUrl: string = '') {
    this.useR2 = useR2;
    this.r2BaseUrl = r2BaseUrl;
    this.assetUrls = this.initializeAssetUrls();
  }

  /**
   * Initialize asset URLs with fallback to local assets
   */
  private initializeAssetUrls(): AssetUrls {
    const localAssets: AssetUrls = {
      brand: {
        qatarAirways: '/src/assets/images/Qatar-Airways-Logo.png',
        privilegeClub: '/src/assets/images/privilege_club_logo.png',
      },
      hotels: {
        millennium: '/src/assets/images/millenium_hotel.webp',
        steigenberger: '/src/assets/images/steigenberger_hotel.webp',
        souqWaqif: '/src/assets/images/souq_waqif_hotel.webp',
        crownePlaza: '/src/assets/images/crowne_plaza_hotel.webp',
        alNajada: '/src/assets/images/al_najada_hotel.webp',
        raffles: '/src/assets/images/raffles_hotel_doha.jpg',
      },
      categories: {
        standard: '/src/assets/images/standard_stopover.jpg',
        premium: '/src/assets/images/premium_stopover.jpg',
        premiumBeach: '/src/assets/images/premium_beach_stopover.jpg',
        luxury: '/src/assets/images/luxury_stopover.jpg',
      },
      tours: {
        whaleSharks: '/src/assets/images/whale sharks of qatar.jpg',
        shaleShark: '/src/assets/images/shale_shark.webp',
        thePearl: '/src/assets/images/the pearl.jpg',
        airportTransfer: '/src/assets/images/airport_transfer.webp',
      },
      general: {
        heroImage: '/src/assets/images/Stopover.jpg',
        stopoverProgram: '/src/assets/images/Qatar-Airways-stopover-program-1200x553.jpeg',
        planeSkyline: '/src/assets/images/plane over skyline.jpg',
      },
    };

    if (this.useR2 && this.r2BaseUrl) {
      return this.generateR2Urls(localAssets);
    }

    return localAssets;
  }

  /**
   * Generate R2 URLs with local fallbacks
   */
  private generateR2Urls(localAssets: AssetUrls): AssetUrls {
    return {
      brand: {
        qatarAirways: this.getR2Url('logos/qatar-airways-logo.png', localAssets.brand.qatarAirways),
        privilegeClub: this.getR2Url('logos/privilege-club-logo.png', localAssets.brand.privilegeClub),
      },
      hotels: {
        millennium: this.getR2Url('hotels/millenium_hotel.webp', localAssets.hotels.millennium),
        steigenberger: this.getR2Url('hotels/steigenberger_hotel.webp', localAssets.hotels.steigenberger),
        souqWaqif: this.getR2Url('hotels/souq_waqif_hotel.webp', localAssets.hotels.souqWaqif),
        crownePlaza: this.getR2Url('hotels/crowne_plaza_hotel.webp', localAssets.hotels.crownePlaza),
        alNajada: this.getR2Url('hotels/al_najada_hotel.webp', localAssets.hotels.alNajada),
        raffles: this.getR2Url('hotels/raffles_hotel_doha.jpg', localAssets.hotels.raffles),
      },
      categories: {
        standard: this.getR2Url('categories/standard_stopover.jpg', localAssets.categories.standard),
        premium: this.getR2Url('categories/premium_stopover.jpg', localAssets.categories.premium),
        premiumBeach: this.getR2Url('categories/premium_beach_stopover.jpg', localAssets.categories.premiumBeach),
        luxury: this.getR2Url('categories/luxury_stopover.jpg', localAssets.categories.luxury),
      },
      tours: {
        whaleSharks: this.getR2Url('tours/whale_sharks_of_qatar.jpg', localAssets.tours.whaleSharks),
        shaleShark: this.getR2Url('tours/shale_shark.webp', localAssets.tours.shaleShark),
        thePearl: this.getR2Url('tours/the_pearl.jpg', localAssets.tours.thePearl),
        airportTransfer: this.getR2Url('tours/airport_transfer.webp', localAssets.tours.airportTransfer),
      },
      general: {
        heroImage: this.getR2Url('general/stopover.jpg', localAssets.general.heroImage),
        stopoverProgram: this.getR2Url('general/stopover_program.jpeg', localAssets.general.stopoverProgram),
        planeSkyline: this.getR2Url('general/plane_skyline.jpg', localAssets.general.planeSkyline),
      },
    };
  }

  /**
   * Get R2 URL with fallback
   */
  private getR2Url(key: string, fallback: string): string {
    if (this.r2BaseUrl) {
      return `${this.r2BaseUrl}/${key}`;
    }
    return fallback;
  }

  /**
   * Get all asset URLs
   */
  getAssetUrls(): AssetUrls {
    return this.assetUrls;
  }

  /**
   * Get brand logo URLs
   */
  getBrandLogos() {
    return this.assetUrls.brand;
  }

  /**
   * Get hotel image URLs
   */
  getHotelImages() {
    return this.assetUrls.hotels;
  }

  /**
   * Get category image URLs
   */
  getCategoryImages() {
    return this.assetUrls.categories;
  }

  /**
   * Get tour image URLs
   */
  getTourImages() {
    return this.assetUrls.tours;
  }

  /**
   * Get general image URLs
   */
  getGeneralImages() {
    return this.assetUrls.general;
  }

  /**
   * Get specific asset URL by category and key
   */
  getAssetUrl(category: keyof AssetUrls, key: string): string {
    const categoryAssets = this.assetUrls[category] as Record<string, string>;
    return categoryAssets[key] || '';
  }

  /**
   * Update asset URLs (for runtime R2 URL updates)
   */
  updateAssetUrls(newUrls: Partial<AssetUrls>): void {
    this.assetUrls = {
      ...this.assetUrls,
      ...newUrls,
    };
  }

  /**
   * Check if asset exists (placeholder for future implementation)
   */
  async checkAssetExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    category: keyof AssetUrls,
    key: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string {
    const baseUrl = this.getAssetUrl(category, key);
    
    // If using R2 with Cloudflare Image Resizing, add transformation parameters
    if (this.useR2 && this.r2BaseUrl) {
      const params = new URLSearchParams();
      
      if (options.width) params.set('width', options.width.toString());
      if (options.height) params.set('height', options.height.toString());
      if (options.quality) params.set('quality', options.quality.toString());
      if (options.format) params.set('format', options.format);
      
      if (params.toString()) {
        return `${baseUrl}?${params.toString()}`;
      }
    }
    
    return baseUrl;
  }
}

/**
 * Global asset manager instance
 */
let globalAssetManager: AssetManager | null = null;

/**
 * Get or create global asset manager
 */
export function getAssetManager(useR2?: boolean, r2BaseUrl?: string): AssetManager {
  if (!globalAssetManager) {
    globalAssetManager = new AssetManager(useR2, r2BaseUrl);
  }
  return globalAssetManager;
}

/**
 * Initialize asset manager with R2 configuration
 */
export function initializeAssetManager(r2BaseUrl: string): AssetManager {
  globalAssetManager = new AssetManager(true, r2BaseUrl);
  return globalAssetManager;
}

/**
 * Get asset URLs for use in components
 */
export function useAssetUrls(): AssetUrls {
  return getAssetManager().getAssetUrls();
}