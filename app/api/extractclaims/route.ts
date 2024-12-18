import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  ExtractClaimsRequestSchema,
  ExtractClaimsResponseSchema,
} from "@/lib/schemas";

// This function can run for a maximum of 60 seconds
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { sentences } = ExtractClaimsRequestSchema.parse(json);

    // Create a string representation of sentences with IDs
    const sentencesWithIds = sentences
      .map(
        (sentence: string, index: number) =>
          `${index + 1}. "${sentence.trim()}"`
      )
      .join("\n");
    // Run the prompt to extract claims along with original text parts
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      output: 'array',
      schema: ExtractClaimsResponseSchema.shape.claims.element,
      prompt: `You are an expert at extracting claims from text.
      Your task is to identify and list all claims present, true or false, in the given text. Each claim should be a single, verifiable statement.
      If the input content is very lengthy, then pick the major claims.

      For each claim, also provide the original part of the sentence from which the claim is derived.
      Present the claims as a JSON array of objects. Each object should have two keys:
      - "claim": the extracted claim in a single verifiable statement.
      - "original_text": the portion of the original text that supports or contains the claim.
      
      Do not include any additional text or commentary.

      Here is the content: ${sentencesWithIds}

      Return the output strictly as a JSON array of objects following this schema:
      [
        {
          "claim": "extracted claim here",
          "original_text": "original text portion here"
        },
        ...
      ]

        Output the result as valid JSON, strictly adhering to the defined schema. Ensure there are no markdown codes or additional elements included in the output. Do not add anything else. Return only JSON.
      `,
    });

    const parsedClaims = ExtractClaimsResponseSchema.parse({
      claims: object,
    });

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