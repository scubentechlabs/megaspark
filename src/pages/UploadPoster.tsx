import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon } from 'lucide-react';

const UploadPoster = () => {
  const [uploading, setUploading] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const uploadPosterFromPublic = async () => {
    setUploading(true);
    try {
      // Fetch the poster from public folder
      const response = await fetch('/poster.jpg');
      const blob = await response.blob();
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('hall-tickets')
        .upload('poster.jpg', blob, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hall-tickets')
        .getPublicUrl('poster.jpg');

      setPosterUrl(publicUrl);
      toast.success('Poster uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload poster: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const loadCurrentPoster = async () => {
    const { data: { publicUrl } } = supabase.storage
      .from('hall-tickets')
      .getPublicUrl('poster.jpg');
    
    setPosterUrl(publicUrl + '?t=' + new Date().getTime());
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            Upload Hall Ticket Poster
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={uploadPosterFromPublic} 
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Poster to Storage'}
            </Button>
            <Button 
              onClick={loadCurrentPoster} 
              variant="outline"
            >
              View Current Poster
            </Button>
          </div>

          {posterUrl && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Current Poster:</p>
              <img 
                src={posterUrl} 
                alt="Hall Ticket Poster" 
                className="w-full border rounded-lg"
              />
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>This will upload the poster.jpg from the public folder to the hall-tickets storage bucket.</p>
            <p className="mt-2">The poster will be used in generated hall ticket PDFs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPoster;
