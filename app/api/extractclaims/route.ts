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
      prompt: `You are an expert at extracting claims from text and crafting precise search queries.
      Your task is to identify and list all claims present, true or false, in the given text. Each claim should be a single, verifiable statement.
      If the input content is very lengthy, then pick the major claims.

      IMPORTANT: Each claim MUST be a continuous, uninterrupted sequence of text from the original content. You cannot combine separate parts or skip over text - the claim must appear exactly as-is in one continuous segment of the original text.

      For each claim, also provide:
      1. The original part of the sentence from which the claim is derived
      2. A search query formatted as a specific, detailed question that would help verify the claim. The question should:
         - Include all relevant context from the claim (dates, numbers, names, etc.)
         - Be specific enough to get accurate results
         - Focus on the core assertion being made
         - Use natural language as a question
         Example questions:
         - For "Tesla sold 500,000 cars in 2020":
           "How many vehicles did Tesla sell globally in 2020?"
         - For "COVID-19 vaccine reduces transmission by 85%":
           "What percentage does the COVID-19 vaccine reduce virus transmission according to scientific studies?"
         - For "Amazon rainforest lost 10,000 acres in 2022":
           "How many acres of Amazon rainforest were lost to deforestation in 2022?"

      Present the claims as a JSON array of objects. Each object should have three keys:
      - "claim": the extracted claim in a single verifiable statement. It should include all the information necessary in order to understand the claim and verify the statement in isolation, without any additional context.
      - "exactText": the portion of the original text that supports or contains the claim. This MUST be a continuous, unbroken sequence of text that appears exactly as-is in the original content.
      - "searchQuery": a specific question that would help verify the claim when searched
      
      Do not include any additional text or commentary in 'exactText'
      Do not combine separate parts of text - each 'exactText' must be continuous and uninterrupted.

      Here is the content: ${text}

      Output the result as valid JSON, strictly adhering to the defined schema. Ensure there are no markdown codes or additional elements included in the output. Do not add anything else. Return only JSON.
      Remember: Each exactText MUST be a continuous sequence of text from the original - no gaps, no combining separate parts.
      `
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
