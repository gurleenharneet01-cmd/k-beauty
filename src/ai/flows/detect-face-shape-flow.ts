'use server';
/**
 * @fileOverview A face shape detection AI agent.
 *
 * - detectFaceShape - A function that handles the face shape detection process.
 * - DetectFaceShapeInput - The input type for the detectFaceShape function.
 * - DetectFaceShapeOutput - The return type for the detectFaceShape function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFaceShapeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectFaceShapeInput = z.infer<typeof DetectFaceShapeInputSchema>;

const FaceShapeOutputSchema = z.object({
  faceShape: z.enum(['Oval', 'Round', 'Square', 'Heart', 'Long', 'Diamond']).describe("The detected face shape of the person in the photo."),
  hairstyles: z.array(z.string()).describe("A list of 2-3 recommended hairstyles for the detected face shape."),
  glasses: z.array(z.string()).describe("A list of 2-3 recommended glasses styles for the detected face shape."),
  reasoning: z.string().describe("A brief explanation for why the face shape was chosen."),
});
export type DetectFaceShapeOutput = z.infer<typeof FaceShapeOutputSchema>;

export async function detectFaceShape(input: DetectFaceShapeInput): Promise<DetectFaceShapeOutput> {
  return detectFaceShapeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFaceShapePrompt',
  input: {schema: DetectFaceShapeInputSchema},
  output: {schema: FaceShapeOutputSchema},
  prompt: `You are an expert stylist who can accurately determine a person's face shape from a photograph.

Analyze the provided photo and determine the user's face shape from the following options: Oval, Round, Square, Heart, Long, Diamond.

Based on the detected face shape, provide a list of 2-3 flattering hairstyles and 2-3 flattering glasses styles.
Also provide a brief reasoning for your face shape determination based on the user's jawline, forehead, and cheekbones.

Photo: {{media url=photoDataUri}}`,
});

const detectFaceShapeFlow = ai.defineFlow(
  {
    name: 'detectFaceShapeFlow',
    inputSchema: DetectFaceShapeInputSchema,
    outputSchema: FaceShapeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
