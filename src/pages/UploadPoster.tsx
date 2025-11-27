import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, RefreshCw, Trash2 } from 'lucide-react';
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UploadPoster = () => {
  const [uploading, setUploading] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const deleteOldPDFs = async () => {
    setDeleting(true);
    try {
      // List all files in the hall-tickets bucket
      const { data: files, error: listError } = await supabase.storage
        .from('hall-tickets')
        .list();

      if (listError) throw listError;

      // Filter to get only PDF files (not poster.jpg)
      const pdfFiles = files?.filter(file => 
        file.name.endsWith('.pdf')
      ) || [];

      if (pdfFiles.length === 0) {
        toast.info('No PDF files found to delete');
        return;
      }

      // Delete all PDF files
      const filePaths = pdfFiles.map(file => file.name);
      const { error: deleteError } = await supabase.storage
        .from('hall-tickets')
        .remove(filePaths);

      if (deleteError) throw deleteError;

      toast.success(`Successfully deleted ${pdfFiles.length} PDF file(s)`);
    } catch (error: any) {
      toast.error('Failed to delete PDFs: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
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
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        disabled={deleting}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleting ? 'Deleting...' : 'Delete All PDFs'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all generated hall ticket PDFs from the storage bucket. 
                          The poster image will not be deleted. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteOldPDFs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete All PDFs
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
