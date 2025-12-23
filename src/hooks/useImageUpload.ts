import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseImageUploadOptions {
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function useImageUpload({
  bucket,
  folder = '',
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File): Promise<string | null> => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`);
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
    }

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(100);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const bucketUrl = `${bucket}/`;
      const pathStart = url.indexOf(bucketUrl);
      if (pathStart === -1) return false;

      const filePath = url.substring(pathStart + bucketUrl.length);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      return !error;
    } catch {
      return false;
    }
  };

  return {
    upload,
    deleteImage,
    uploading,
    progress,
  };
}
