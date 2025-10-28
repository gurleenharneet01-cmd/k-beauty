'use client';

import { useEffect, useState, useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { analyzeSkinTone, type FormState } from './actions';
import { AnalysisForm } from './components/analysis-form';
import { AnalysisResults } from './components/analysis-results';
import { AnalysisSkeleton } from './components/analysis-skeleton';

const initialState: FormState = {
  data: null,
  error: null,
};

export default function AnalysisPage() {
  const [state, formAction, isPending] = useActionState(analyzeSkinTone, initialState);
  const { toast } = useToast();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI Skin Analyzer
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Upload a clear, well-lit photo of your face to get started.
            </p>
          </div>
          <AnalysisForm 
            formAction={formAction} 
            isPending={isPending} 
            imagePreviewUrl={imagePreviewUrl}
            setImagePreviewUrl={setImagePreviewUrl}
          />
        </div>
        <div className="min-h-[400px]">
          {isPending ? (
            <AnalysisSkeleton />
          ) : (
            state.data && <AnalysisResults result={state.data} imagePreviewUrl={imagePreviewUrl} />
          )}
        </div>
      </div>
    </div>
  );
}
