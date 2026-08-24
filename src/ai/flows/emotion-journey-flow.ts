'use server';
/**
 * @fileOverview AI flow to generate a transitionary playlist between two emotional states.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EmotionJourneyInputSchema = z.object({
  fromMood: z.string().describe('The current emotional state of the user.'),
  toMood: z.string().describe('The target emotional state the user wants to reach.'),
});
export type EmotionJourneyInput = z.infer<typeof EmotionJourneyInputSchema>;

const EmotionJourneyOutputSchema = z.object({
  journeyName: z.string().describe('A therapeutic name for the journey.'),
  stages: z.array(z.object({
    mood: z.string().describe('The intermediate mood at this stage.'),
    searchTerms: z.array(z.string()).describe('2-3 songs for this stage.'),
    description: z.string().describe('How these songs bridge the emotional gap.'),
  })).describe('A 3-stage emotional bridge.'),
});
export type EmotionJourneyOutput = z.infer<typeof EmotionJourneyOutputSchema>;

export async function generateEmotionJourney(input: EmotionJourneyInput): Promise<EmotionJourneyOutput> {
  return emotionJourneyFlow(input);
}

const journeyPrompt = ai.definePrompt({
  name: 'emotionJourneyPrompt',
  input: { schema: EmotionJourneyInputSchema },
  output: { schema: EmotionJourneyOutputSchema },
  prompt: `You are a music therapist. The user is currently feeling "{{{fromMood}}}" and wants to feel "{{{toMood}}}".

Design a 3-stage musical journey to transition them. 
Stage 1: Validating the current mood.
Stage 2: The bridge/shift.
Stage 3: Arriving at the target mood.

For each stage, provide 2-3 specific "Song Name by Artist" search terms.`,
});

const emotionJourneyFlow = ai.defineFlow(
  {
    name: 'emotionJourneyFlow',
    inputSchema: EmotionJourneyInputSchema,
    outputSchema: EmotionJourneyOutputSchema,
  },
  async (input) => {
    const { output } = await journeyPrompt(input);
    return output!;
  }
);
