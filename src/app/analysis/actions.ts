'use server';

import { performAnalysis, type AnalysisResult } from '@/lib/color-analysis';
import { z } from 'zod';

export type FormState = {
  status: 'initial' | 'success' | 'error';
  message: string;
  analysis?: AnalysisResult | null;
};

const schema = z.object({
  image: z.instanceof(File),
});

export async function analyzeSkinTone(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = schema.safeParse({
      image: formData.get('image'),
    });

    if (!validatedFields.success) {
      return {
        status: 'error',
        message: 'Invalid form data. Please upload an image.',
        analysis: null,
      };
    }
    
    const { image } = validatedFields.data;

    if (image.size === 0) {
      return {
        status: 'error',
        message: 'Please upload an image.',
        analysis: null,
      };
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const analysisResult = await performAnalysis(imageBuffer);

    return {
      status: 'success',
      message: 'Analysis complete.',
      analysis: analysisResult,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      status: 'error',
      message: errorMessage,
      analysis: null,
    };
  }
}
