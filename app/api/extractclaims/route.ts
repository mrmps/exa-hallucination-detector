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
      prompt: `You are an expert at extracting meaningful factual claims from text and crafting precise search queries.
      Your task is to identify and list only the key factual claims that are explicitly stated in the given text.
      Each claim must be a complete, standalone statement that can be understood and verified without any context from the original text.

      IMPORTANT REQUIREMENTS:
      1. Each claim MUST be:
         - A complete, standalone statement that makes sense by itself
         - Specific and detailed enough to be searchable on the internet
         - Written with all necessary context included in the statement itself
         - Clear enough that someone who never saw the original text would understand it
      
      2. DO NOT create claims that:
         - Require context from the original text to understand
         - Use pronouns without clear antecedents
         - Reference "this technique" or "this process" without naming it
         - Start with phrases like "At query time..." or "The generation step..."
      
      3. The 'exactText' MUST be:
         - A continuous, uninterrupted sequence from the original text
         - The specific portion containing the core claim
      
      4. The 'claim' should EXPAND the exactText to be fully self-contained by:
         - Adding necessary context from elsewhere in the text
         - Replacing pronouns with their actual references
         - Including full names/terms instead of abbreviations
         - Making implicit subjects explicit

      Example BAD claims:
      ❌ "At query time, the system uses both indices"
      ❌ "This technique enhances each chunk"
      ❌ "The model generates responses using 405B"

      Example GOOD claims:
      ✅ "Contextual Retrieval is a chunk augmentation technique that uses large language models to enhance data chunks"
      ✅ "The Contextual RAG system uses Reciprocal Rank Fusion (RRF) to combine keyword and semantic search results"
      ✅ "The Llama 3.1 405B language model is used in Contextual RAG systems for generating final responses"

      Here is the content: ${text}

      Extract only clear, complete claims that would make sense to someone who has never seen the original text.
      Each claim should be independently searchable and verifiable.
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
