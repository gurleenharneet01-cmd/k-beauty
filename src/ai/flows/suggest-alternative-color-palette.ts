'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative color palettes based on a given skin tone.
 *
 * The flow takes a skin tone as input and returns alternative fashion and makeup color recommendations.
 * - `suggestAlternativeColorPalette`:  A function that takes a skin tone and returns alternative color palettes.
 * - `AlternativePaletteInput`: The input type for the suggestAlternativeColorPalette function.
 * - `AlternativePaletteOutput`: The return type for the suggestAlternativeColorPalette function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AlternativePaletteInputSchema = z.object({
  skinTone: z.string().describe('The skin tone to generate alternative color palettes for.'),
});
export type AlternativePaletteInput = z.infer<typeof AlternativePaletteInputSchema>;

const AlternativePaletteOutputSchema = z.object({
  recommendations: z.object({
    fashion: z.array(z.string()).describe('Alternative fashion color recommendations.'),
    makeup: z.array(z.string()).describe('Alternative makeup color recommendations.'),
  }).describe('Alternative color recommendations for fashion and makeup.'),
});
export type AlternativePaletteOutput = z.infer<typeof AlternativePaletteOutputSchema>;

export async function suggestAlternativeColorPalette(input: AlternativePaletteInput): Promise<AlternativePaletteOutput> {
  return suggestAlternativeColorPaletteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'alternativePalettePrompt',
  input: {schema: AlternativePaletteInputSchema},
  output: {schema: AlternativePaletteOutputSchema},
  prompt: `Given the skin tone "{{{skinTone}}}", suggest alternative color palettes for fashion and makeup. These should be different from the original recommendations.

Output the alternative color palettes in the following JSON format:
{
  "recommendations": {
    "fashion": ["color1", "color2", "color3"],
    "makeup": ["color1", "color2", "color3"]
  }
}`,
});

const suggestAlternativeColorPaletteFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeColorPaletteFlow',
    inputSchema: AlternativePaletteInputSchema,
    outputSchema: AlternativePaletteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
