
CREATE TABLE public.about_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.about_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view about gallery" ON public.about_gallery FOR SELECT USING (true);
CREATE POLICY "Admins can insert about gallery" ON public.about_gallery FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update about gallery" ON public.about_gallery FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete about gallery" ON public.about_gallery FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO storage.buckets (id, name, public) VALUES ('about-images', 'about-images', true);

CREATE POLICY "Anyone can view about images" ON storage.objects FOR SELECT USING (bucket_id = 'about-images');
CREATE POLICY "Admins can upload about images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'about-images');
CREATE POLICY "Admins can update about images" ON storage.objects FOR UPDATE USING (bucket_id = 'about-images');
CREATE POLICY "Admins can delete about images" ON storage.objects FOR DELETE USING (bucket_id = 'about-images');
