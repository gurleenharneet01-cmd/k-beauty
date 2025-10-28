'use client';

import { useRef, type Dispatch, type SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUp, Loader2, Send } from 'lucide-react';
import Image from 'next/image';

interface AnalysisFormProps {
  formAction: (payload: FormData) => void;
  setIsPending: Dispatch<SetStateAction<boolean>>;
  imagePreviewUrl: string | null;
  setImagePreviewUrl: Dispatch<SetStateAction<string | null>>;
  isPending: boolean;
}

export function AnalysisForm({ formAction, setIsPending, imagePreviewUrl, setImagePreviewUrl, isPending }: AnalysisFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div
            className="flex items-center justify-center w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80"
            >
              {imagePreviewUrl ? (
                <div className="relative w-full h-full">
                   <Image src={imagePreviewUrl} alt="Preview" layout="fill" objectFit="contain" className="rounded-lg" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageUp className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="dropzone-file"
                name="image"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={isPending}
              />
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={!imagePreviewUrl || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze My Skin Tone <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
