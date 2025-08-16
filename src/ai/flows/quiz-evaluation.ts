'use server';
/**
 * @fileOverview Evaluates a quiz and provides feedback on areas needing practice.
 *
 * - evaluateQuiz - A function that handles the quiz evaluation process.
 * - EvaluateQuizInput - The input type for the evaluateQuiz function.
 * - EvaluateQuizOutput - The return type for the evaluateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateQuizInputSchema = z.object({
  quizData: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.string(),
      userAnswer: z.string().optional(),
    })
  ),
});
export type EvaluateQuizInput = z.infer<typeof EvaluateQuizInputSchema>;

const EvaluateQuizOutputSchema = z.object({
  score: z.number().describe('The overall quiz score (0-100).'),
  feedback: z.string().describe('Short, personalized feedback (2-3 sentences) on areas needing practice. Use simple Markdown for bullet points or bold text to highlight specific tones or words.'),
});
export type EvaluateQuizOutput = z.infer<typeof EvaluateQuizOutputSchema>;

export async function evaluateQuiz(input: EvaluateQuizInput): Promise<EvaluateQuizOutput> {
  return evaluateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateQuizPrompt',
  input: {schema: EvaluateQuizInputSchema},
  output: {schema: EvaluateQuizOutputSchema},
  prompt: `You are an expert Vietnamese language tutor. You are given the results of a quiz taken by a student learning Vietnamese tones.

Evaluate the quiz and provide a score out of 100. 

Then provide short, personalized feedback (2-3 sentences max). Use simple markdown (like **bold** for emphasis or * for bullet points) to highlight the specific tones or words they struggled with. Be encouraging.

Quiz Data:
{{#each quizData}}
- Question: {{this.question}}
  - Correct Answer: {{this.correctAnswer}}
  - User Answer: {{this.userAnswer}}
{{/each}}
`,
});

const evaluateQuizFlow = ai.defineFlow(
  {
    name: 'evaluateQuizFlow',
    inputSchema: EvaluateQuizInputSchema,
    outputSchema: EvaluateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
