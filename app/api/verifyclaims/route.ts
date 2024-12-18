import { NextRequest, NextResponse } from 'next/server';
import { openai } from "@ai-sdk/openai";
import { generateObject } from 'ai';
import { z } from 'zod';
import { VerifyClaimsLLMResponseSchema, SourceSchema } from '@/lib/schemas';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const InputSchema = z.object({
      claim: z.string(),
      sources: z.array(SourceSchema)
    });

    const { claim, sources } = InputSchema.parse(body);

    // Generate verification response from LLM
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: VerifyClaimsLLMResponseSchema,
      prompt: `You are an expert fact-checker with extensive experience in verification and source analysis. Your task is to carefully analyze the provided claim against the given sources to determine its veracity.

      Claim to factcheck: ${claim}
      Sources: ${JSON.stringify(sources, null, 2)}

      Approach your analysis systematically:
      1. First, thoroughly read and understand the claim
      2. Examine each source carefully, looking for direct evidence that supports or contradicts the claim
      3. Consider the reliability and relevance of each source
      4. Look for any nuances or context that might affect the claim's accuracy
      
      Provide a comprehensive verification response that includes:
      - A clear verdict on the claim's status:
        * SUPPORTED: When sources directly confirm the claim
        * CONTRADICTED: When sources directly disprove the claim
        * DEBATED: When sources show significant disagreement
        * INSUFFICIENT INFORMATION: When sources don't provide enough evidence
      
      - A confidence score (0-100) that reflects:
        * The quality and quantity of available evidence
        * The directness of the source material
        * The consistency across multiple sources
        * The reliability of the sources
      
      - A detailed explanation including:
        * Direct quotes from sources that support your verdict
        * Analysis of any contradictions or nuances
        * Discussion of source reliability and relevance
        * Clear reasoning for your confidence score
      
      - If the claim is contradicted:
        * Provide a specific correction based on the sources
        * Explain what makes the original claim incorrect
        * Suggest precise language for an accurate version
      
      Always cite specific sources and quotes to support your assessment.`,
      output: 'object'
    });

    const verifiedClaim = VerifyClaimsLLMResponseSchema.parse(object);

    return NextResponse.json(verifiedClaim);

  } catch (error: any) {
    console.error('Verify claims API error:', error);
    return NextResponse.json({ error: `Failed to verify claim | ${error.message || error}` }, { status: 500 });
  }
}
