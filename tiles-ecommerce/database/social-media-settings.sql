-- Social Media Settings Database Update
-- Adds social media links to site_settings for admin configuration

-- Add social media settings to site_settings table
INSERT INTO site_settings (key, value, description) VALUES
('social_facebook_url', 'https://facebook.com/promac.ro', 'Link către pagina de Facebook'),
('social_instagram_url', 'https://instagram.com/promac.ro', 'Link către pagina de Instagram'),
('social_tiktok_url', 'https://tiktok.com/@promac.ro', 'Link către pagina de TikTok'),
('social_youtube_url', 'https://youtube.com/@promac.ro', 'Link către canalul de YouTube')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verify the social media settings were added
SELECT key, value, description FROM site_settings WHERE key LIKE 'social_%' ORDER BY key;