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

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      output: 'array',
      schema: LLMExtractedClaimSchema,
      prompt: `You are an expert at extracting claims from text.
      Your task is to identify and list all claims present, true or false, in the given text. Each claim should be a single, verifiable statement.
      If the input content is very lengthy, then pick the major claims.

      IMPORTANT: Each claim MUST be a continuous, uninterrupted sequence of text from the original content. You cannot combine separate parts or skip over text - the claim must appear exactly as-is in one continuous segment of the original text.

      For each claim, also provide the original part of the sentence from which the claim is derived.
      Present the claims as a JSON array of objects. Each object should have two keys:
      - "claim": the extracted claim in a single verifiable statement. It should include all the information necessary in order to understand the claim and verify the statement in isolation, without any additional context.
      - "exactText": the portion of the original text that supports or contains the claim.This MUST be a continuous, unbroken sequence of text that appears exactly as-is in the original content.
      
      Do not include any additional text or commentary in 'exactText'
      Do not combine separate parts of text - each 'exactText' must be continuous and uninterrupted.

      Here is the content: ${text}

      Return the output strictly as a JSON array of objects following this schema:
      [
        {
          "claim": "extracted claim here (must include all necessary information to verify the statement in isolation)",
          "exactText": "original text portion here (must be continuous text)"
        },
        ...
      ]

      Output the result as valid JSON, strictly adhering to the defined schema. Ensure there are no markdown codes or additional elements included in the output. Do not add anything else. Return only JSON.
      Remember: Each exactText MUST be a continuous sequence of text from the original - no gaps, no combining separate parts.
      `
    });

    const llmClaims = Array.isArray(object[0]) ? object[0] : object;

    // Now find start/end indices and add IDs
    const claimsWithIndices = (llmClaims as Array<{claim: string, exactText: string}>).map((c, index) => {
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
        sources: []
      };
    }).filter((claim): claim is NonNullable<typeof claim> => claim !== null);

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
