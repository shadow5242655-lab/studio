'use server';
/**
 * @fileOverview AI flow to generate a list of search queries based on a user's vibe description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VibePlaylistInputSchema = z.object({
  vibe: z.string().describe('A description of the mood or vibe for the playlist.'),
});
export type VibePlaylistInput = z.infer<typeof VibePlaylistInputSchema>;

const VibePlaylistOutputSchema = z.object({
  playlistName: z.string().describe('A creative name for this vibe-based playlist.'),
  searchTerms: z.array(z.string()).describe('A list of 5-8 specific song or artist names that match the vibe.'),
  reasoning: z.string().describe('Why these specific sounds were chosen.'),
});
export type VibePlaylistOutput = z.infer<typeof VibePlaylistOutputSchema>;

export async function generateVibePlaylist(input: VibePlaylistInput): Promise<VibePlaylistOutput> {
  return vibePlaylistFlow(input);
}

const vibePrompt = ai.definePrompt({
  name: 'vibePlaylistPrompt',
  input: { schema: VibePlaylistInputSchema },
  output: { schema: VibePlaylistOutputSchema },
  prompt: `You are an elite music curator at AYUMUSIC. A user wants a playlist based on this description: "{{{vibe}}}".

Generate a creative playlist name and suggest 5-8 specific song search terms (formatted as "Song Name by Artist") that perfectly capture this vibe. 

Think across genres but stay cohesive. Avoid overly generic pop unless it fits the specific mood.`,
});

const vibePlaylistFlow = ai.defineFlow(
  {
    name: 'vibePlaylistFlow',
    inputSchema: VibePlaylistInputSchema,
    outputSchema: VibePlaylistOutputSchema,
  },
  async (input) => {
    const { output } = await vibePrompt(input);
    return output!;
  }
);
