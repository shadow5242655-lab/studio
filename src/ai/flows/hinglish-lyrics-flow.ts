'use server';
/**
 * @fileOverview AI flow to convert song lyrics into Hinglish (Hindi in Roman script).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HinglishLyricsInputSchema = z.object({
  text: z.string().describe('The original song lyrics.'),
  isSynced: z.boolean().describe('Whether the input is LRC synced format.'),
});
export type HinglishLyricsInput = z.infer<typeof HinglishLyricsInputSchema>;

const HinglishLyricsOutputSchema = z.object({
  hinglishText: z.string().describe('The lyrics converted to Hinglish.'),
});
export type HinglishLyricsOutput = z.infer<typeof HinglishLyricsOutputSchema>;

export async function convertToHinglish(input: HinglishLyricsInput): Promise<HinglishLyricsOutput> {
  return hinglishLyricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hinglishLyricsPrompt',
  input: { schema: HinglishLyricsInputSchema },
  output: { schema: HinglishLyricsOutputSchema },
  prompt: `You are a high-end music translator. Convert the following lyrics into Hinglish (Hindi words written in English letters). 

Guidelines:
1. If the lyrics are in Devanagari (Hindi), transliterate them to English letters (e.g., "नमस्ते" becomes "Namaste").
2. If the lyrics are in English, translate them into a natural Hindi-English mix (Hinglish) that captures the emotion of the song.
3. IMPORTANT: If the input is in LRC format (e.g. [00:12.34] text), MUST preserve the timestamps exactly as they are at the start of each line.
4. Do not add any conversational filler. Only output the Hinglish lyrics.

Lyrics:
{{{text}}}`,
});

const hinglishLyricsFlow = ai.defineFlow(
  {
    name: 'hinglishLyricsFlow',
    inputSchema: HinglishLyricsInputSchema,
    outputSchema: HinglishLyricsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
