'use server';
/**
 * @fileOverview Provides reasoning for color recommendations based on skin tone analysis.
 *
 * - provideReasoningForColorRecommendations - A function that provides reasoning for color recommendations.
 * - ProvideReasoningForColorRecommendationsInput - The input type for the provideReasoningForColorRecommendations function.
 * - ProvideReasoningForColorRecommendationsOutput - The return type for the provideReasoningForColorRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideReasoningForColorRecommendationsInputSchema = z.object({
  skinTone: z.string().describe('The user\'s skin tone (e.g., fair warm, medium cool).'),
  fashionColors: z.array(z.string()).describe('Array of recommended fashion colors.'),
  makeupColors: z.array(z.string()).describe('Array of recommended makeup colors.'),
});
export type ProvideReasoningForColorRecommendationsInput = z.infer<typeof ProvideReasoningForColorRecommendationsInputSchema>;

const ProvideReasoningForColorRecommendationsOutputSchema = z.object({
  fashionReasoning: z.string().describe('Explanation of why the fashion colors are recommended.'),
  makeupReasoning: z.string().describe('Explanation of why the makeup colors are recommended.'),
});
export type ProvideReasoningForColorRecommendationsOutput = z.infer<typeof ProvideReasoningForColorRecommendationsOutputSchema>;

export async function provideReasoningForColorRecommendations(input: ProvideReasoningForColorRecommendationsInput): Promise<ProvideReasoningForColorRecommendationsOutput> {
  return provideReasoningForColorRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideReasoningForColorRecommendationsPrompt',
  input: {schema: ProvideReasoningForColorRecommendationsInputSchema},
  output: {schema: ProvideReasoningForColorRecommendationsOutputSchema},
  prompt: `You are a personal stylist providing explanations for color recommendations based on a user's skin tone.

  Skin Tone: {{{skinTone}}}
  Fashion Colors: {{#each fashionColors}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Makeup Colors: {{#each makeupColors}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Explain in one short sentence why these fashion colors are recommended for this skin tone:
  
  Explain in one short sentence why these makeup colors are recommended for this skin tone:
  `,
});

const provideReasoningForColorRecommendationsFlow = ai.defineFlow(
  {
    name: 'provideReasoningForColorRecommendationsFlow',
    inputSchema: ProvideReasoningForColorRecommendationsInputSchema,
    outputSchema: ProvideReasoningForColorRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
