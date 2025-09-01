# Supabase Storage Setup for Product Images

## 1. Create Storage Bucket

Execute in Supabase Dashboard → Storage → Create Bucket:

**Bucket Name:** `product-images`
**Public:** ✅ Yes (for fast CDN delivery)
**File Size Limit:** 5MB
**Allowed MIME Types:** image/jpeg, image/png, image/webp

## 2. Bucket Policies (Security)

Execute in Supabase SQL Editor:

```sql
-- Allow everyone to view product images (public bucket)
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow only admins to upload/update product images
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admins to update product images
CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admins to delete product images
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

## 3. Folder Structure

The images will be organized as follows:

```
product-images/
├── products/
│   ├── {product-id}/
│   │   ├── main.jpg          # Primary product image
│   │   ├── gallery-1.jpg     # Additional images
│   │   ├── gallery-2.jpg
│   │   └── thumb.jpg         # Thumbnail (generated)
├── categories/
│   ├── category-icon-1.jpg
│   └── category-icon-2.jpg
└── temp/
    └── {upload-id}.jpg       # Temporary uploads before product creation
```

## 4. Image Processing Rules

- **Maximum file size:** 5MB
- **Allowed formats:** JPEG, PNG, WebP
- **Recommended dimensions:** 
  - Main product image: 800x800px
  - Gallery images: 600x600px
  - Thumbnails: 300x300px (auto-generated)
- **Quality:** 85% JPEG compression for balance between quality and file size

## 5. Environment Variables

Add to your `.env` file:

```env
# Supabase Storage
VITE_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
```

## 6. Client-Side Image Optimization

Before upload, images should be:

1. **Resized** to maximum 800x800px for main images
2. **Compressed** to ~85% quality
3. **Converted** to WebP format when supported
4. **Validated** for file size and type

## 7. Usage Examples

### Upload Product Image:
```typescript
const uploadProductImage = async (productId: number, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `products/${productId}/main.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
```

### Get Product Image URL:
```typescript
const getProductImageUrl = (imagePath: string): string => {
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(imagePath)
  
  return data.publicUrl
}
```

## 8. Image Transformations (Optional)

Supabase supports on-the-fly image transformations:

```typescript
// Get optimized thumbnail
const thumbnailUrl = getProductImageUrl('products/1/main.jpg?width=300&height=300&resize=cover')

// Get WebP version
const webpUrl = getProductImageUrl('products/1/main.jpg?format=webp&quality=85')
```

## 9. Backup and CDN

- **Automatic Backup:** Supabase handles backups automatically
- **CDN:** Images are served via Supabase CDN for fast global delivery
- **Caching:** Set appropriate cache headers for optimal performance

## 10. Monitoring

Monitor storage usage in Supabase Dashboard:
- Storage → Settings → Usage
- Set up alerts for approaching storage limits
- Monitor bandwidth usage for cost optimization

---

**Note:** After creating the bucket and setting up policies, update the admin dashboard to use these configurations for image uploads.