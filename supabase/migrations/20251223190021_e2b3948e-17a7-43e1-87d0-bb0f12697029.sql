
-- Create storage bucket for tenant assets (branding images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for tenant-assets bucket

-- Anyone can view public tenant assets
CREATE POLICY "Anyone can view tenant assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-assets');

-- Restaurant owners can upload to their own folder (folder name = restaurant_id)
CREATE POLICY "Owners can upload tenant assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tenant-assets' 
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id::text = (storage.foldername(name))[1]
    AND restaurants.owner_id = auth.uid()
  )
);

-- Restaurant owners can update their own assets
CREATE POLICY "Owners can update tenant assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tenant-assets' 
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id::text = (storage.foldername(name))[1]
    AND restaurants.owner_id = auth.uid()
  )
);

-- Restaurant owners can delete their own assets
CREATE POLICY "Owners can delete tenant assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tenant-assets' 
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id::text = (storage.foldername(name))[1]
    AND restaurants.owner_id = auth.uid()
  )
);

-- Admins can manage all tenant assets
CREATE POLICY "Admins can manage all tenant assets"
ON storage.objects FOR ALL
USING (
  bucket_id = 'tenant-assets' 
  AND has_role(auth.uid(), 'admin')
);
