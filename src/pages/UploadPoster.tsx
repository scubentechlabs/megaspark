import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const UploadPoster = () => {
  const [uploading, setUploading] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      setPosterUrl(publicUrl + '?t=' + new Date().getTime());
      toast.success('Poster uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload poster: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const loadCurrentPoster = async () => {
    setLoading(true);
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('hall-tickets')
        .getPublicUrl('poster.jpg');
      
      setPosterUrl(publicUrl + '?t=' + new Date().getTime());
      toast.success('Poster loaded successfully');
    } catch (error: any) {
      toast.error('Failed to load poster: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1">
          <header className="h-14 border-b flex items-center px-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <SidebarTrigger className="mr-4" />
            <div>
              <h1 className="text-xl font-semibold">Upload Hall Ticket Poster</h1>
              <p className="text-sm text-muted-foreground">Manage the poster image for hall ticket PDFs</p>
            </div>
          </header>

          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Poster Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={uploadPosterFromPublic} 
                    disabled={uploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Poster to Storage'}
                  </Button>
                  <Button 
                    onClick={loadCurrentPoster} 
                    variant="outline"
                    disabled={loading}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'View Current Poster'}
                  </Button>
                </div>

                {posterUrl && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Current Poster Preview:</p>
                    <div className="border rounded-lg overflow-hidden bg-muted/30">
                      <img 
                        src={posterUrl} 
                        alt="Hall Ticket Poster" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <h4 className="text-sm font-semibold">Instructions:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>This will upload the poster.jpg from the public folder to the hall-tickets storage bucket</li>
                    <li>The poster will be automatically embedded in generated hall ticket PDFs</li>
                    <li>Use "View Current Poster" to preview the currently stored poster</li>
                    <li>The upload will replace any existing poster with the same name</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UploadPoster;
