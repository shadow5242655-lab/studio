'use server';
/**
 * @fileOverview An AI-powered curation consultant that recommends matching garments.
 *
 * - garmentRecommendation - A function that handles the garment recommendation process.
 * - GarmentRecommendationInput - The input type for the garmentRecommendation function.
 * - GarmentRecommendationOutput - The return type for the garmentRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GarmentRecommendationInputSchema = z.object({
  fabricTypes: z
    .array(z.string())
    .describe(
      'A list of fabric types the user has selected, e.g., "silk", "cotton", "linen".'
    ),
  occasion: z
    .string()
    .describe(
      'The occasion the user is shopping for, e.g., "wedding", "casual outing", "business meeting".'
    ),
});
export type GarmentRecommendationInput = z.infer<
  typeof GarmentRecommendationInputSchema
>;

const GarmentRecommendationOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        name: z.string().describe('The name of the recommended garment.'),
        type: z
          .string()
          .describe(
            'The type of garment, e.g., "dress", "shirt", "trousers", "jacket".'
          ),
        fabric: z
          .string()
          .describe('The primary fabric of the recommended garment.'),
        description: z
          .string()
          .describe(
            'A brief description of the recommended garment and its features.'
          ),
        matchingReason: z
          .string()
          .describe(
            'Explanation of how this garment matches the selected fabric types and occasion.'
          ),
        stylingTips: z
          .string()
          .describe('Tips on how to style this garment for the given occasion.'),
      })
    )
    .describe('A list of recommended garments based on the input criteria.'),
});
export type GarmentRecommendationOutput = z.infer<
  typeof GarmentRecommendationOutputSchema
>;

export async function garmentRecommendation(
  input: GarmentRecommendationInput
): Promise<GarmentRecommendationOutput> {
  return garmentRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'garmentRecommendationPrompt',
  input: { schema: GarmentRecommendationInputSchema },
  output: { schema: GarmentRecommendationOutputSchema },
  prompt: `You are an AI-powered curation consultant for Shiv Clothes House and Garments. Your task is to recommend matching garments based on the user's selected fabric types and the occasion they are shopping for. Provide detailed recommendations that include the garment name, type, primary fabric, a description, why it matches the given criteria, and styling tips.

Selected Fabric Types:
{{#each fabricTypes}}
- {{{this}}}
{{/each}}

Occasion: {{{occasion}}}

Based on these inputs, recommend a complete outfit or individual matching garments. Ensure your recommendations are stylish, appropriate for the occasion, and highlight the beauty of the specified fabrics.`,
});

const garmentRecommendationFlow = ai.defineFlow(
  {
    name: 'garmentRecommendationFlow',
    inputSchema: GarmentRecommendationInputSchema,
    outputSchema: GarmentRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
