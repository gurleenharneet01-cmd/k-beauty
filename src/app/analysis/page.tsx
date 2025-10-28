'use client';
import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { analyzeSkinTone, type FormState } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Upload } from 'lucide-react';
import Image from 'next/image';
import AnalysisResults from './results';

const initialState: FormState = {
  status: 'initial',
  message: '',
  analysis: null,
};

export default function AnalysisPage() {
  const [state, formAction, isPending] = useActionState(analyzeSkinTone, initialState);
  const { toast } = useToast();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {state.status === 'success' && state.analysis ? (
           <AnalysisResults analysis={state.analysis} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Skin Tone Analysis</CardTitle>
              <CardDescription>
                Upload a clear, well-lit photo of your face to get personalized color recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload Photo</Label>
                  <Input
                    id="image-upload"
                    name="image"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    required
                    className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>

                {imagePreviewUrl && (
                  <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg border">
                    <Image
                      src={imagePreviewUrl}
                      alt="Selected image preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Analyze Skin Tone
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
