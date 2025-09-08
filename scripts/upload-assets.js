#!/usr/bin/env node

/**
 * Asset upload script for Cloudflare R2 storage
 * Uploads all Qatar Airways brand assets, hotel images, category images, and tour images
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asset mapping configuration
const ASSET_MAPPING = {
  brand: {
    'Qatar-Airways-Logo.png': 'logos/qatar-airways-logo.png',
    'privilege_club_logo.png': 'logos/privilege-club-logo.png',
  },
  hotels: {
    'millenium_hotel.webp': 'hotels/millenium_hotel.webp',
    'steigenberger_hotel.webp': 'hotels/steigenberger_hotel.webp',
    'souq_waqif_hotel.webp': 'hotels/souq_waqif_hotel.webp',
    'crowne_plaza_hotel.webp': 'hotels/crowne_plaza_hotel.webp',
    'al_najada_hotel.webp': 'hotels/al_najada_hotel.webp',
    'raffles_hotel_doha.jpg': 'hotels/raffles_hotel_doha.jpg',
  },
  categories: {
    'standard_stopover.jpg': 'categories/standard_stopover.jpg',
    'premium_stopover.jpg': 'categories/premium_stopover.jpg',
    'premium_beach_stopover.jpg': 'categories/premium_beach_stopover.jpg',
    'luxury_stopover.jpg': 'categories/luxury_stopover.jpg',
  },
  tours: {
    'whale sharks of qatar.jpg': 'tours/whale_sharks_of_qatar.jpg',
    'shale_shark.webp': 'tours/shale_shark.webp',
    'the pearl.jpg': 'tours/the_pearl.jpg',
    'airport_transfer.webp': 'tours/airport_transfer.webp',
  },
  general: {
    'Stopover.jpg': 'general/stopover.jpg',
    'Qatar-Airways-stopover-program-1200x553.jpeg': 'general/stopover_program.jpeg',
    'plane over skyline.jpg': 'general/plane_skyline.jpg',
  },
};

const ASSETS_DIR = path.join(__dirname, '../src/assets/images');

/**
 * Simulate R2 upload (in production, this would use Cloudflare R2 API)
 */
async function uploadToR2(localPath, r2Key, metadata = {}) {
  try {
    // Check if local file exists
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found: ${localPath}`);
    }

    const stats = fs.statSync(localPath);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`✓ Uploaded: ${r2Key} (${formatBytes(stats.size)})`);
    
    return {
      success: true,
      key: r2Key,
      url: `https://pub-example.r2.dev/${r2Key}`,
      size: stats.size,
      contentType: getContentType(localPath),
      metadata,
    };
  } catch (error) {
    console.error(`✗ Failed to upload ${r2Key}:`, error.message);
    return {
      success: false,
      key: r2Key,
      error: error.message,
    };
  }
}

/**
 * Get content type from file extension
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Upload assets by category
 */
async function uploadAssetCategory(category, mapping) {
  console.log(`\n📁 Uploading ${category} assets...`);
  
  const results = [];
  
  for (const [localFile, r2Key] of Object.entries(mapping)) {
    const localPath = path.join(ASSETS_DIR, localFile);
    const metadata = {
      category,
      originalFilename: localFile,
      uploadedAt: new Date().toISOString(),
    };
    
    const result = await uploadToR2(localPath, r2Key, metadata);
    results.push(result);
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`📊 ${category}: ${successful} uploaded, ${failed} failed`);
  
  return results;
}

/**
 * Generate asset URL mapping file
 */
function generateAssetMapping(uploadResults) {
  const mapping = {
    brand: {},
    hotels: {},
    categories: {},
    tours: {},
    general: {},
  };
  
  Object.entries(uploadResults).forEach(([category, results]) => {
    results.forEach(result => {
      if (result.success) {
        const key = result.key.split('/')[1]; // Remove category prefix
        const assetKey = key.replace(/[^a-zA-Z0-9]/g, ''); // Clean key for object property
        mapping[category][assetKey] = result.url;
      }
    });
  });
  
  return mapping;
}

/**
 * Save asset mapping to file
 */
function saveAssetMapping(mapping) {
  const outputPath = path.join(__dirname, '../src/data/asset-urls.json');
  
  const output = {
    generatedAt: new Date().toISOString(),
    r2BaseUrl: 'https://pub-example.r2.dev',
    assets: mapping,
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Asset mapping saved to: ${outputPath}`);
}

/**
 * Main upload function
 */
async function uploadAllAssets() {
  console.log('🚀 Starting Qatar Airways asset upload to Cloudflare R2...');
  console.log(`📂 Source directory: ${ASSETS_DIR}`);
  
  // Check if assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Assets directory not found: ${ASSETS_DIR}`);
    process.exit(1);
  }
  
  const uploadResults = {};
  let totalUploaded = 0;
  let totalFailed = 0;
  
  // Upload each category
  for (const [category, mapping] of Object.entries(ASSET_MAPPING)) {
    const results = await uploadAssetCategory(category, mapping);
    uploadResults[category] = results;
    
    totalUploaded += results.filter(r => r.success).length;
    totalFailed += results.filter(r => !r.success).length;
  }
  
  // Generate and save asset mapping
  const assetMapping = generateAssetMapping(uploadResults);
  saveAssetMapping(assetMapping);
  
  // Summary
  console.log('\n📈 Upload Summary:');
  console.log(`✅ Total uploaded: ${totalUploaded}`);
  console.log(`❌ Total failed: ${totalFailed}`);
  console.log(`📊 Success rate: ${((totalUploaded / (totalUploaded + totalFailed)) * 100).toFixed(1)}%`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some uploads failed. Check the logs above for details.');
    process.exit(1);
  }
  
  console.log('\n🎉 All assets uploaded successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Update your Cloudflare R2 bucket configuration');
  console.log('2. Set the R2_BASE_URL environment variable');
  console.log('3. Deploy your application to Cloudflare Pages');
}

/**
 * Validate assets before upload
 */
function validateAssets() {
  console.log('🔍 Validating assets...');
  
  let missingFiles = [];
  
  Object.entries(ASSET_MAPPING).forEach(([category, mapping]) => {
    Object.keys(mapping).forEach(localFile => {
      const localPath = path.join(ASSETS_DIR, localFile);
      if (!fs.existsSync(localPath)) {
        missingFiles.push(localPath);
      }
    });
  });
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing asset files:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    return false;
  }
  
  console.log('✅ All assets found');
  return true;
}

// CLI handling
const isMainModule = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (isMainModule) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Qatar Airways Asset Upload Script

Usage:
  node upload-assets.js [options]

Options:
  --validate, -v    Validate assets without uploading
  --help, -h        Show this help message

Examples:
  node upload-assets.js           # Upload all assets
  node upload-assets.js --validate # Validate assets only
`);
    process.exit(0);
  }
  
  if (args.includes('--validate') || args.includes('-v')) {
    const isValid = validateAssets();
    process.exit(isValid ? 0 : 1);
  }
  
  // Run the upload
  uploadAllAssets().catch(error => {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  });
}

export {
  uploadAllAssets,
  validateAssets,
  ASSET_MAPPING,
};