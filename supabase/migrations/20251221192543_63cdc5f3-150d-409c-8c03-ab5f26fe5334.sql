-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true);

-- Allow anyone to view business images
CREATE POLICY "Business images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Allow authenticated users to upload business images
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-images' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own business images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own business images"
ON storage.objects FOR DELETE
USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);