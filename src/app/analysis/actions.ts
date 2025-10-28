
'use server';

import { performAnalysis, type AnalysisResult } from '@/lib/color-analysis';

export type FormState = {
  data: AnalysisResult | null;
  error: string | null;
};

export async function analyzeSkinTone(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const imageFile = formData.get('image') as File;
  if (!imageFile || imageFile.size === 0) {
    return { data: null, error: 'Please select an image to analyze.' };
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await performAnalysis(buffer);
    return { data: result, error: null };
  } catch (error) {
    console.error('Error in analyzeSkinTone action:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    return { data: null, error: errorMessage };
  }
}
