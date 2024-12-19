// app/api/searchandverify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from 'zod';
import Exa from "exa-js";

import {
  SearchAndVerifyRequestSchema,
  SearchAndVerifyResponseSchema,
  ClaimStatusSchema,
  type SearchAndVerifyRequest,
  type Claim,
  ExaSourceSchema,
  LLMCitedSourceSchema,
  MergedSourceSchema,
  LLMVerificationResultSchema
} from '@/lib/schemas';

const exa = new Exa(process.env.EXA_API_KEY as string);

async function searchExaForClaim(claimText: string): Promise<z.infer<typeof ExaSourceSchema>[]> {
  const result = await exa.searchAndContents(
    `Query: ${claimText}\nFind pages that can verify this claim:`,
    {
      type: "auto",
      numResults: 3,
      livecrawl: 'always',
      text: true,
    }
  );

  const sources = result.results.map((item: any, index: number) => {
    const sourceText = (item.text || '').slice(0, 300); // limit to 300 chars
    return {
      url: item.url,
      title: item.title,
      sourceNumber: index + 1,
      sourceText
    };
  });

  sources.forEach((src: unknown) => {
    ExaSourceSchema.parse(src);
  });

  return sources;
}

async function verifyClaimWithLLM(claimText: string, sources: z.infer<typeof ExaSourceSchema>[]) {
  const sourcesJson = JSON.stringify(sources, null, 2);

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: LLMVerificationResultSchema,
    prompt: `You are an expert fact-checker. Given a claim and its sources, verify the claim comprehensively.
Instructions:
- Read the claim carefully.
- Analyze the provided sources, determining how each relates to the claim.
- status: Choose one of "supported", "contradicted", "debated", or "insufficient information".
- confidence: Provide a numeric 0-100 confidence score in your conclusion.
- explanation: A detailed, clear explanation. Include references like {{1}}, {{2}} at the end of sentences that rely on the corresponding sources. Make sure every reference number corresponds to a sourceNumber in citedSources.
- If status is "contradicted", provide a suggestedFix with a corrected version of the claim.
- For citedSources: Each sourceNumber must match exactly those cited in explanation. supports = true/false based on if it directly supports the claim. agreementPercentage and pertinence show how strongly it supports or relates to the claim.
}

Now apply this logic to the following input.

Claim:
${claimText}

Sources:
${sourcesJson}`
  });

  const verification = LLMVerificationResultSchema.parse(object);
  return verification;
}

function buildFinalClaim(
  id: number,
  exactText: string,
  claimText: string,
  start: number,
  end: number,
  verification: z.infer<typeof LLMVerificationResultSchema>,
  exaSources: z.infer<typeof ExaSourceSchema>[]
): Claim {
  // Merge cited sources with exa sources
  const mergedSources = verification.citedSources.map(cited => {
    const exaSource = exaSources.find(e => e.sourceNumber === cited.sourceNumber);
    // If no matching exaSource, create fallback
    const base = exaSource ? { ...exaSource } : {
      url: "https://example.com",
      title: undefined,
      sourceNumber: cited.sourceNumber,
      sourceText: ""
    };

    return MergedSourceSchema.parse({
      ...base,
      ...cited
    });
  });

  return {
    id,
    exactText,
    claim: claimText,
    start,
    end,
    status: verification.status,
    confidence: verification.confidence,
    explanation: verification.explanation,
    suggestedFix: verification.suggestedFix,
    sources: mergedSources
  };
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { claims } = SearchAndVerifyRequestSchema.parse(json);

    // claims have id, exactText, claim, start, end
    // status='not yet verified', confidence/explanation/sources not set yet
    // We'll do search + verify for each claim in parallel
    const finalClaimsPromises = claims.map(async (c) => {
      const exaSources = await searchExaForClaim(c.claim);
      const verification = await verifyClaimWithLLM(c.claim, exaSources);
      const finalClaim = buildFinalClaim(
        c.id,
        c.exactText,
        c.claim,
        c.start,
        c.end,
        verification,
        exaSources
      );
      return finalClaim;
    });

    const finalClaims = await Promise.all(finalClaimsPromises);

    const response = { claims: finalClaims };
    const parsed = SearchAndVerifyResponseSchema.parse(response);
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Error in /api/searchandverify:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Search and verify failed: ${message}` }, { status: 500 });
  }
}
