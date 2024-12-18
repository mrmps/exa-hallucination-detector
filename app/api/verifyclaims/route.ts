// app/api/verifyclaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from "@ai-sdk/openai";
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { claim, sentenceIds, sources } = await req.json();

    if (!claim || !sources) {
      return NextResponse.json({ error: 'Claim and sources are required' }, { status: 400 });
    }

    const verifiedClaimSchema = z.object({
      id: z.number(),
      text: z.string(),
      sentenceIds: z.array(z.number()),
      status: z.enum(['supported', 'contradicted', 'unverified']),
      confidence: z.number().min(0).max(100),
      explanation: z.string(),
      suggestedFix: z.string().optional(),
      sources: z.array(z.object({
        url: z.string(),
        title: z.string(),
        quote: z.string(),
        relevance: z.number().min(0).max(100),
        supports: z.boolean()
      }))
    });

    const { object } = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: verifiedClaimSchema,
      prompt: `You are an expert fact-checker. Analyze this claim and the provided sources to determine if the claim is supported, contradicted, or unverified.

      Claim: ${claim}
      Sources: ${JSON.stringify(sources, null, 2)}

      Generate a detailed verification response that includes:
      - Whether the claim is supported, contradicted, or unverified based on the sources
      - A confidence score (0-100) for your assessment
      - A clear explanation of your reasoning
      - If contradicted, suggest a correction
      - Include relevant quotes and sources that support your assessment`,
      output: 'object'
    });

    console.log('LLM response:', object);
    
    return NextResponse.json({ claim: object });
  } catch (error) {
    console.error('Verify claims API error:', error);
    return NextResponse.json({ error: `Failed to verify claim | ${error}` }, { status: 500 });
  }
}