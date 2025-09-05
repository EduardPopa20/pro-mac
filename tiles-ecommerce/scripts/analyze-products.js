import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://pntxtquqckqjixfhqmrt.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function getProducts() {
  try {
    const { data: categories } = await supabase.from('categories').select('*');
    console.log('Categories:', categories?.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
    
    const { data: products } = await supabase
      .from('products')
      .select('id, name, category_id, image_url, brand, material')
      .order('category_id, name');
      
    console.log('\n--- PRODUCTS BY CATEGORY ---');
    
    let totalProducts = 0;
    let productsWithImages = 0;
    
    categories?.forEach(cat => {
      const catProducts = products?.filter(p => p.category_id === cat.id) || [];
      const withImages = catProducts.filter(p => p.image_url).length;
      
      console.log(`\n${cat.name} (${cat.slug}) - ${catProducts.length} products (${withImages} with images):`);
      
      catProducts.forEach(p => {
        console.log(`  - ${p.name} (Brand: ${p.brand || 'N/A'}, Material: ${p.material || 'N/A'}, Image: ${p.image_url ? 'YES' : 'NO'})`);
      });
      
      totalProducts += catProducts.length;
      productsWithImages += withImages;
    });
    
    console.log(`\n--- SUMMARY ---`);
    console.log(`Total products: ${totalProducts}`);
    console.log(`Products with images: ${productsWithImages}`);
    console.log(`Products without images: ${totalProducts - productsWithImages}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getProducts();