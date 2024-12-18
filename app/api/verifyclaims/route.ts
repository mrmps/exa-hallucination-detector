import { NextRequest, NextResponse } from 'next/server';
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  VerifyClaimsRequestSchema,
  VerifyClaimsResponseSchema,
} from '@/lib/schemas';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { claims } = VerifyClaimsRequestSchema.parse(json);

    // We'll provide all claims and sources and ask the LLM to return a JSON array with verification results.
    const claimsJson = JSON.stringify(claims, null, 2);

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: VerifyClaimsResponseSchema,
      prompt: `You are an expert fact-checker. Given a list of claims with their sources, return a JSON object with "verifications", which is an array corresponding to each claim in the same order.

For each claim, determine:
- status: "supported", "contradicted", "debated", or "insufficient information"
- confidence: a number 0-100
- explanation: a detailed explanation referencing the sources
- suggestedFix: optional string if contradicted

Return strictly in this format:
{
  "verifications": [
    {
      "claimId": number,
      "status": "supported"|"contradicted"|"debated"|"insufficient information",
      "confidence": number,
      "explanation": string,
      "suggestedFix": string (optional)
    },
    ...
  ]
}

No extra commentary. 

Claims and sources:
${claimsJson}`
    });

    const parsed = VerifyClaimsResponseSchema.parse(object);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Error in verifyclaims API:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Verification failed: ${message}` }, { status: 500 });
  }
}
