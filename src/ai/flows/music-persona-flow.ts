'use server';
/**
 * @fileOverview AI flow to generate a poetic listening persona based on music history.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MusicPersonaInputSchema = z.object({
  history: z.array(z.string()).describe('A list of song names the user has listened to recently.'),
});
export type MusicPersonaInput = z.infer<typeof MusicPersonaInputSchema>;

const MusicPersonaOutputSchema = z.object({
  personaTitle: z.string().describe('A short, catchy title for the persona (e.g., The Midnight Weaver).'),
  description: z.string().describe('A poetic description of their musical taste.'),
  dominantMood: z.string().describe('The primary mood of their library.'),
  recommendationStyle: z.string().describe('How they should discover new music.'),
});
export type MusicPersonaOutput = z.infer<typeof MusicPersonaOutputSchema>;

export async function generateMusicPersona(input: MusicPersonaInput): Promise<MusicPersonaOutput> {
  return musicPersonaFlow(input);
}

const personaPrompt = ai.definePrompt({
  name: 'musicPersonaPrompt',
  input: { schema: MusicPersonaInputSchema },
  output: { schema: MusicPersonaOutputSchema },
  prompt: `You are a world-class music critic and spiritual guide. Based on the following song history, craft a deeply poetic "Music Persona" for the user.

History:
{{#each history}}
- {{{this}}}
{{/each}}

The persona should feel high-end, mysterious, and validating. Avoid generic terms. Use words like "tapestry," "resonance," "frequency," and "lineage."`,
});

const musicPersonaFlow = ai.defineFlow(
  {
    name: 'musicPersonaFlow',
    inputSchema: MusicPersonaInputSchema,
    outputSchema: MusicPersonaOutputSchema,
  },
  async (input) => {
    const { output } = await personaPrompt(input);
    return output!;
  }
);
