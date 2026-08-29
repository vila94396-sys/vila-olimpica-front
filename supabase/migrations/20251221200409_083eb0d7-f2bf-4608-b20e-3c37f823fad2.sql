-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true);

-- Allow anyone to view news images
CREATE POLICY "Anyone can view news images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'news-images');

-- Allow admins to upload news images
CREATE POLICY "Admins can upload news images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update news images
CREATE POLICY "Admins can update news images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete news images
CREATE POLICY "Admins can delete news images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));