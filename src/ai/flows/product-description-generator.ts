'use server';
/**
 * @fileOverview An AI tool to generate descriptive storytelling for garments.
 *
 * - generateProductDescription - A function that generates a product description based on garment details.
 * - ProductDescriptionGeneratorInput - The input type for the generateProductDescription function.
 * - ProductDescriptionGeneratorOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductDescriptionGeneratorInputSchema = z.object({
  garmentName: z.string().describe('The name of the garment.'),
  fabricType: z.string().describe('The type of fabric (e.g., silk, cotton, linen).'),
  craftsmanship: z.string().describe('Unique crafting details (e.g., hand-embroidered, block-printed, hand-woven).'),
  materialOrigin: z.string().describe('The origin of the material (e.g., Indian subcontinent, local artisans).'),
  occasion: z.string().describe('Suitable occasions for the garment (e.g., festive wear, casual, formal).'),
});
export type ProductDescriptionGeneratorInput = z.infer<typeof ProductDescriptionGeneratorInputSchema>;

const ProductDescriptionGeneratorOutputSchema = z.object({
  description: z.string().describe('The generated descriptive storytelling for the garment.'),
});
export type ProductDescriptionGeneratorOutput = z.infer<typeof ProductDescriptionGeneratorOutputSchema>;

export async function generateProductDescription(input: ProductDescriptionGeneratorInput): Promise<ProductDescriptionGeneratorOutput> {
  return productDescriptionGeneratorFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: ProductDescriptionGeneratorInputSchema},
  output: {schema: ProductDescriptionGeneratorOutputSchema},
  prompt: `As an expert copywriter for a high-end textile brand named SHIV CLOTHES HOUSE AND GARMENTS, your task is to craft an engaging and informative product description.

The description should highlight the unique craftsmanship and material origin, weaving a storytelling narrative around the garment.

Garment Name: {{{garmentName}}}
Fabric Type: {{{fabricType}}}
Craftsmanship: {{{craftsmanship}}}
Material Origin: {{{materialOrigin}}}
Occasion: {{{occasion}}}

Using the details above, write a compelling product description that evokes warmth, heritage, and the artisanal quality of the textile. Focus on making the customer feel the story behind the garment.`,
});

const productDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'productDescriptionGeneratorFlow',
    inputSchema: ProductDescriptionGeneratorInputSchema,
    outputSchema: ProductDescriptionGeneratorOutputSchema,
  },
  async input => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
