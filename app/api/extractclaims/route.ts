import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  LLMExtractedClaimSchema
} from "@/lib/schemas";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { text } = json;

    const llmClaims = await generateObject({
      model: openai("gpt-4o-mini"),
      output: 'array',
      schema: LLMExtractedClaimSchema,
      prompt: `Extract all valid claims from the following text, while following the schema exactly: ${text}`
    });

    // Now find start/end indices and add IDs
    const claimsWithIndices = llmClaims.object.map((c, index) => {
      // Use lastIndexOf to find the last occurrence in case text appears multiple times
      const start = text.lastIndexOf(c.exactText); 
      if (start === -1) {
        console.error(`Claim "${c.exactText}" not found in the provided text.`);
        return null;
      }
      const end = start + c.exactText.length;

      return {
        id: index + 1,
        exactText: c.exactText,
        claim: c.claim,
        start,
        end,
        status: 'not yet verified' as const,
        confidence: null,
        explanation: null,
        sources: [],
        searchQuery: c.searchQuery
      };
    }).filter((claim): claim is NonNullable<typeof claim> => claim !== null);

    // Validate that each claim has a searchQuery
    const missingSearchQueries = claimsWithIndices.filter(claim => !claim.searchQuery);
    if (missingSearchQueries.length > 0) {
      throw new Error("All claims must have a searchQuery. Missing searchQuery for claims: " + 
        missingSearchQueries.map(c => `"${c.claim}"`).join(", "));
    } //TODO: remove this once we have search queries

    return NextResponse.json({ claims: claimsWithIndices.slice(0, 5) });
  } catch (error) {
    console.error("Error in extractclaims API:", error);
    const errorMessage = 
      error instanceof Error 
        ? error.message
        : "Unknown error occurred while extracting claims";
    return NextResponse.json(
      { error: `Failed to extract claims | ${errorMessage}` },
      { status: 500 }
    );
  }
}
