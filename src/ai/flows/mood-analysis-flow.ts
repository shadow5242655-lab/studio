'use server';
/**
 * @fileOverview AI flow to analyze the current track's mood and suggest similar frequencies.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MoodAnalysisInputSchema = z.object({
  songName: z.string().describe('The name of the current song.'),
  artistName: z.string().describe('The artist of the current song.'),
});
export type MoodAnalysisInput = z.infer<typeof MoodAnalysisInputSchema>;

const MoodAnalysisOutputSchema = z.object({
  mood: z.string().describe('The predicted mood of the track (e.g., Melancholic, Energetic).'),
  nextQueries: z.array(z.string()).describe('3-5 search queries for similar-sounding tracks.'),
  reasoning: z.string().describe('Why these frequencies match the current resonance.'),
});
export type MoodAnalysisOutput = z.infer<typeof MoodAnalysisOutputSchema>;

export async function analyzeMood(input: MoodAnalysisInput): Promise<MoodAnalysisOutput> {
  return moodAnalysisFlow(input);
}

const moodPrompt = ai.definePrompt({
  name: 'moodAnalysisPrompt',
  input: { schema: MoodAnalysisInputSchema },
  output: { schema: MoodAnalysisOutputSchema },
  prompt: `You are the AYUMUSIC Neural Architect. Analyze the track "{{{songName}}}" by "{{{artistName}}}".

1. Determine its emotional frequency (mood).
2. Suggest 3-5 specific "Song Name by Artist" queries that would seamlessly continue this sound lineage.
3. Focus on high-fidelity, genre-matched resonance.`,
});

const moodAnalysisFlow = ai.defineFlow(
  {
    name: 'moodAnalysisFlow',
    inputSchema: MoodAnalysisInputSchema,
    outputSchema: MoodAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await moodPrompt(input);
    return output!;
  }
);
