import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Curated image URLs from Dedeman, Ceramall and other sources 
// organized by category and product characteristics
const IMAGE_DATABASE = {
  faianta: [
    {
      name: "Faianță Albă Clasică",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/f/a/faianta_alb_1.jpg",
      keywords: ["albă", "clasică", "white", "classic"]
    },
    {
      name: "Faianță Beige Naturală", 
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/f/a/faianta_beige_2.jpg",
      keywords: ["beige", "naturală", "natural"]
    },
    {
      name: "Faianță Gri Urban",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/f/a/faianta_gri_3.jpg", 
      keywords: ["gri", "urban", "grey", "gray"]
    },
    {
      name: "Faianță Crem Elegantă",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/f/a/faianta_crem_4.jpg",
      keywords: ["crem", "elegantă", "cream", "elegant"]
    },
    {
      name: "Faianță Albastru Ocean",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/f/a/faianta_albastru_5.jpg",
      keywords: ["albastru", "ocean", "blue"]
    }
  ],
  gresie: [
    {
      name: "Gresie Bej Travertin",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/g/r/gresie_bej_travertin_1.jpg",
      keywords: ["bej", "travertin", "beige", "travertine"]
    },
    {
      name: "Gresie Gri Modern",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/g/r/gresie_gri_modern_2.jpg",
      keywords: ["gri", "modern", "grey", "contemporary"]
    },
    {
      name: "Gresie Marmură Carrara",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/g/r/gresie_marmura_carrara_3.jpg",
      keywords: ["marmură", "carrara", "marble"]
    },
    {
      name: "Gresie Lemn Rustic",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/g/r/gresie_lemn_rustic_4.jpg",
      keywords: ["lemn", "rustic", "wood", "wooden"]
    },
    {
      name: "Gresie Neagră Premium",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/g/r/gresie_neagra_premium_5.jpg",
      keywords: ["neagră", "premium", "black"]
    },
    {
      name: "Gresie Exterior Antracit",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/g/r/gresie_exterior_antracit_6.jpg",
      keywords: ["exterior", "antracit", "anthracite", "outdoor"]
    }
  ],
  mozaic: [
    {
      name: "Mozaic Sticlă Albastru",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/m/o/mozaic_sticla_albastru_1.jpg",
      keywords: ["sticlă", "albastru", "glass", "blue"]
    },
    {
      name: "Mozaic Ceramic Traditional",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/m/o/mozaic_ceramic_traditional_2.jpg", 
      keywords: ["ceramic", "traditional"]
    },
    {
      name: "Mozaic Piatră Naturală",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/m/o/mozaic_piatra_naturala_3.jpg",
      keywords: ["piatră", "naturală", "stone", "natural"]
    },
    {
      name: "Mozaic Metalic Gold",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/m/o/mozaic_metalic_gold_4.jpg",
      keywords: ["metalic", "gold", "auriu", "metal"]
    }
  ],
  accesorii: [
    {
      name: "Adeziv Flexibil C2TE",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/a/d/adeziv_flexibil_c2te_1.jpg",
      keywords: ["adeziv", "flexibil", "adhesive", "flexible"]
    },
    {
      name: "Chit de Rosturi Epoxidic",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/c/h/chit_rosturi_epoxidic_2.jpg",
      keywords: ["chit", "rosturi", "epoxidic", "grout", "epoxy"]
    },
    {
      name: "Spacere Cruciforme 3mm",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/s/p/spacere_cruciforme_3mm_3.jpg",
      keywords: ["spacere", "cruciforme", "3mm", "spacers", "cross"]
    },
    {
      name: "Profil Finisare Aluminiu",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/p/r/profil_finisare_aluminiu_4.jpg",
      keywords: ["profil", "finisare", "aluminiu", "profile", "aluminum"]
    },
    {
      name: "Sistem Nivelare DLS",
      url: "https://cdn.dedeman.ro/media/catalog/product/cache/dedeman/9df78eab33525d08d6e5fb8d27136e95/s/i/sistem_nivelare_dls_5.jpg",
      keywords: ["sistem", "nivelare", "dls", "leveling", "system"]
    }
  ]
};

// Alternative image sources (backup URLs from various tile suppliers)
const BACKUP_IMAGES = {
  faianta: [
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&crop=center", 
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=500&fit=crop&crop=center"
  ],
  gresie: [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1571079570759-8328b5aa9ba4?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1595515106969-9d6c6d7e3ea6?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&crop=center"
  ],
  mozaic: [
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1571079570759-8328b5aa9ba4?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1564540583246-934409427776?w=500&h=500&fit=crop&crop=center"
  ],
  accesorii: [
    "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=500&fit=crop&crop=center", 
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&crop=center"
  ]
};

// Helper function to find best matching image
function findBestMatch(productName, category) {
  const categoryImages = IMAGE_DATABASE[category] || [];
  
  // Try to find exact or close match based on keywords
  const productLower = productName.toLowerCase();
  
  let bestMatch = null;
  let highestScore = 0;
  
  categoryImages.forEach((imageData, index) => {
    let score = 0;
    
    // Check if any keyword matches the product name
    imageData.keywords.forEach(keyword => {
      if (productLower.includes(keyword.toLowerCase())) {
        score += keyword.length; // Longer keywords get higher scores
      }
    });
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = { ...imageData, index };
    }
  });
  
  // If no good match found, use backup images
  if (!bestMatch || highestScore === 0) {
    const backupImages = BACKUP_IMAGES[category] || BACKUP_IMAGES.faianta;
    const randomIndex = Math.floor(Math.random() * backupImages.length);
    return {
      name: productName,
      url: backupImages[randomIndex],
      keywords: [category],
      isBackup: true
    };
  }
  
  return bestMatch;
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file async
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Upload image to Supabase storage
async function uploadImageToSupabase(filepath, filename) {
  try {
    const fileBuffer = fs.readFileSync(filepath);
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(`products/${filename}`, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(`products/${filename}`);
      
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error.message);
    throw error;
  }
}

// Update product image URL in database
async function updateProductImage(productId, imageUrl) {
  const { error } = await supabase
    .from('products')
    .update({ image_url: imageUrl })
    .eq('id', productId);
    
  if (error) {
    throw error;
  }
}

// Main function to process all products
async function processProducts() {
  try {
    console.log('🔍 Starting product image search and update process...\n');
    
    // Create images directory if it doesn't exist
    const imagesDir = path.join(__dirname, '../temp-images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Get all products without images
    const { data: products } = await supabase
      .from('products')
      .select('id, name, category_id, image_url')
      .is('image_url', null);
      
    const { data: categories } = await supabase.from('categories').select('*');
    
    console.log(`Found ${products.length} products without images to process\n`);
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const product of products) {
      const category = categories.find(c => c.id === product.category_id);
      const categorySlug = category?.slug || 'unknown';
      
      console.log(`\n📦 Processing: ${product.name} (${category?.name || 'Unknown Category'})`);
      
      try {
        // Find best matching image
        const imageMatch = findBestMatch(product.name, categorySlug);
        console.log(`   🎯 Found image match: ${imageMatch.isBackup ? 'Backup' : 'Curated'} - ${imageMatch.url}`);
        
        // Generate filename
        const filename = `product_${product.id}_${Date.now()}.jpg`;
        const filepath = path.join(imagesDir, filename);
        
        // Download image
        console.log(`   ⬇️  Downloading image...`);
        await downloadImage(imageMatch.url, filepath);
        
        // Upload to Supabase
        console.log(`   ⬆️  Uploading to Supabase...`);
        const publicUrl = await uploadImageToSupabase(filepath, filename);
        
        // Update database
        console.log(`   💾 Updating database...`);
        await updateProductImage(product.id, publicUrl);
        
        // Clean up local file
        fs.unlinkSync(filepath);
        
        successful++;
        console.log(`   ✅ Successfully updated ${product.name}`);
        
      } catch (error) {
        failed++;
        console.log(`   ❌ Failed to process ${product.name}: ${error.message}`);
      }
      
      processed++;
      console.log(`   📊 Progress: ${processed}/${products.length} (${successful} success, ${failed} failed)`);
      
      // Add a small delay to avoid overwhelming the servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n🎉 Processing complete!`);
    console.log(`📊 Final Results:`);
    console.log(`   - Total processed: ${processed}`);
    console.log(`   - Successful updates: ${successful}`);
    console.log(`   - Failed updates: ${failed}`);
    console.log(`   - Success rate: ${((successful / processed) * 100).toFixed(1)}%`);
    
    // Clean up temp directory
    if (fs.existsSync(imagesDir)) {
      fs.rmSync(imagesDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned up temporary files`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the script
if (process.argv[1] === __filename) {
  processProducts();
}

export { processProducts, findBestMatch, downloadImage, uploadImageToSupabase };