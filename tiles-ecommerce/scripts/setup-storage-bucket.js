import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setupStorageBucket() {
  try {
    console.log('🪣 Setting up Supabase storage bucket for product images...\n');
    
    // First, let's check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Error listing buckets:', listError.message);
      return;
    }
    
    console.log('📋 Existing buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
    });
    
    const productImagesBucket = buckets.find(bucket => bucket.name === 'product-images');
    
    if (productImagesBucket) {
      console.log('\n✅ Product images bucket already exists!');
      
      // Check if it's public
      if (!productImagesBucket.public) {
        console.log('⚠️ Bucket exists but is not public. This might cause issues with image display.');
      }
      
    } else {
      console.log('\n🆕 Creating product-images bucket...');
      
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB limit
      });
      
      if (createError) {
        console.log('❌ Error creating bucket:', createError.message);
        
        // If we can't create it via the client, provide manual instructions
        console.log('\n📝 Manual setup instructions:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Navigate to Storage section');
        console.log('3. Create a new bucket named "product-images"');
        console.log('4. Make sure it\'s set to Public');
        console.log('5. Set allowed MIME types: image/jpeg, image/jpg, image/png, image/webp');
        console.log('6. Set file size limit: 5MB');
        
        return;
      }
      
      console.log('✅ Successfully created product-images bucket!');
    }
    
    // Test upload functionality
    console.log('\n🧪 Testing upload functionality...');
    
    // Create a small test file
    const testContent = Buffer.from('test image content');
    const testFilename = `test-${Date.now()}.txt`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(`test/${testFilename}`, testContent, {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message);
      
      if (uploadError.message.includes('new row violates row-level security')) {
        console.log('\n🔐 RLS (Row Level Security) might be blocking uploads.');
        console.log('📝 You may need to set up proper RLS policies for the storage bucket.');
        console.log('   Run this SQL in your Supabase SQL editor:');
        console.log(`
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Policy for authenticated users to upload product images  
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Policy for authenticated users to update product images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Policy for authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');
        `);
      }
      
    } else {
      console.log('✅ Upload test successful!');
      
      // Clean up test file
      await supabase.storage
        .from('product-images')
        .remove([`test/${testFilename}`]);
      
      console.log('🧹 Test file cleaned up');
    }
    
    console.log('\n🎉 Storage setup complete! You can now run the image update script.');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

setupStorageBucket();