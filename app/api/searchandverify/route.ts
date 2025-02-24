// app/api/searchandverify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import Exa from "exa-js";

import {
  SearchAndVerifyRequestSchema,
  SearchAndVerifyResponseSchema,
  type Claim,
  ExaSourceSchema,
  MergedSourceSchema,
  LLMVerificationResultSchema,
} from "@/lib/schemas";

const exa = new Exa(process.env.EXA_API_KEY as string);

// Helper function to handle Zod errors consistently
function handleZodError(schema: string, data: unknown, err: z.ZodError): never {
  const errorDetails = err.errors.map(e => {
    const path = e.path.join('.');
    const value = path ? `Value at ${path}: ${JSON.stringify(e.path.reduce((obj: any, key) => obj?.[key], data))}` : 'undefined';
    return `${value} - ${e.message}`;
  }).join('\n');

  throw new Error(
    `Invalid ${schema} format:\n` +
    `Input: ${JSON.stringify(data, null, 2)}\n` +
    `Validation errors:\n${errorDetails}`
  );
}

async function searchExaForClaim(
  searchQuery: string
): Promise<z.infer<typeof ExaSourceSchema>[]> {
  const results = await exa.searchAndContents(searchQuery, {
    type: "auto",
    numResults: 3,
    livecrawl: "always",
    text: true,
  });

  const sources = results.results.map((item: any, index: number) => {
    const sourceText = (item.text || "").slice(0, 300); // limit to 300 chars
    return {
      url: item.url,
      title: item.title,
      sourceNumber: index + 1,
      sourceText,
    };
  });

  sources.forEach((src: unknown) => {
    try {
      ExaSourceSchema.parse(src);
    } catch (err) {
      if (err instanceof z.ZodError) {
        handleZodError('ExaSource', src, err);
      }
      throw err;
    }
  });

  return sources;
}

async function verifyClaimWithLLM(
  claimText: string,
  searchQuery: string,
  sources: z.infer<typeof ExaSourceSchema>[]
) {
  const sourcesJson = JSON.stringify(sources, null, 2);

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: LLMVerificationResultSchema,
    prompt: `You are an expert fact-checker. Given a claim and its sources, verify the claim comprehensively.

Instructions:
- Read the claim, search query, and sources carefully to understand the full context.
- Then create the verification result following the schema exactly.

Claim:
${claimText}

Search Query Used:
${searchQuery}

Sources:
${sourcesJson}`,
  });

  try {
    const verification = LLMVerificationResultSchema.parse(object);
    return verification;
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log("Zod error in verifyClaimWithLLM");
      handleZodError('LLMVerificationResult', object, err);
    }
    throw err;
  }
}

function buildFinalClaim(
  id: number,
  exactText: string,
  claimText: string,
  start: number,
  end: number,
  verification: z.infer<typeof LLMVerificationResultSchema>,
  exaSources: z.infer<typeof ExaSourceSchema>[],
  searchQuery: string
): Claim {
  // Merge cited sources with exa sources
  const mergedSources = verification.citedSources.map((cited) => {
    const exaSource = exaSources.find(
      (e) => e.sourceNumber === cited.sourceNumber
    );
    // If no matching exaSource, create fallback
    const base = exaSource
      ? { ...exaSource }
      : {
          url: "https://example.com",
          title: undefined,
          sourceNumber: cited.sourceNumber,
          sourceText: "",
        };

    try {
      return MergedSourceSchema.parse({
        ...base,
        ...cited,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log("Zod error in buildFinalClaim");
        handleZodError('MergedSource', { ...base, ...cited }, err);
      }
      throw err;
    }
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
    sources: mergedSources,
    searchQuery: searchQuery,
  };
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    let parsedRequest;
    try {
      parsedRequest = SearchAndVerifyRequestSchema.parse(json);
    } catch (err) {
      if (err instanceof z.ZodError) {
        handleZodError('SearchAndVerifyRequest', json, err);
      }
      throw err;
    }

    const { claims } = parsedRequest;

    // claims have id, exactText, claim, start, end, searchQuery
    // status='not yet verified', confidence/explanation/sources not set yet
    // We'll do search + verify for each claim in parallel
    const finalClaimsPromises = claims.map(async (c) => {
      const exaSources = await searchExaForClaim(c.searchQuery);
      const verification = await verifyClaimWithLLM(c.claim, c.searchQuery, exaSources);
      const finalClaim = buildFinalClaim(
        c.id,
        c.exactText,
        c.claim,
        c.start,
        c.end,
        verification,
        exaSources,
        c.searchQuery
      );
      return finalClaim;
    });

    const finalClaims = await Promise.all(finalClaimsPromises);

    const response = { claims: finalClaims };
    try {
      const parsed = SearchAndVerifyResponseSchema.parse(response);
      return NextResponse.json(parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        handleZodError('SearchAndVerifyResponse', response, err);
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Error in /api/searchandverify:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Search and verify failed: ${message}` },
      { status: 500 }
    );
  }
}
