import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  ExtractClaimsResponseSchema,
} from "@/lib/schemas";

// This function can run for a maximum of 60 seconds
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { sentences } = json as { sentences: string[] };

    // We don't rely on sentenceIds anymore, just show sentences with indexes.
    const sentencesWithIds = sentences
      .map((sentence: string, index: number) =>
        `${index + 1}. "${sentence.trim()}"`
      )
      .join("\n");

    // Prompt the model
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      output: 'array',
      // We now know the model returns objects with { "claim", "original_text" }.
      // We'll just trust `generateObject` to parse them into JS objects.
      schema: ExtractClaimsResponseSchema.shape.claims.element,
      prompt: `You are an expert at extracting claims from text.
      Your task is to identify and list all claims present, true or false, in the given text. Each claim should be a single, verifiable statement.
      If the input content is very lengthy, pick the major claims.

      For each claim, also provide the exact substring "original_text" from the given text that contains the claim.

      Return the output strictly as a JSON array of objects following this schema:
      [
        {
          "claim": "extracted claim here",
          "original_text": "exact substring from the text here"
        },
        ...
      ]

      Do not add extra commentary. Return only JSON.
      
      Here is the content:
      ${sentencesWithIds}
      `,
    });

    const parsedClaims = ExtractClaimsResponseSchema.parse({ claims: object });

    return NextResponse.json(parsedClaims);
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
