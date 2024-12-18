// app/api/exasearch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";
import { ExaSearchRequestSchema, ExaSearchResponseSchema } from '@/lib/schemas';

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { claim } = ExaSearchRequestSchema.parse(json);

    // Use Exa to search for content related to the claim
    const result = await exa.searchAndContents(
      `Query: ${claim} \nHere is a web page to help verify this claim:`,
      {
        type: "auto",
        numResults: 3,
        livecrawl: 'always',
        text: true,
      }
    );

    // Process and validate results
    const simplifiedResults = result.results.map((item: any) => ({
      text: item.text,
      url: item.url,
      // Include other properties if available
      title: item.title,
      quote: item.quote,
      relevance: item.relevance,
      supports: item.supports,
    }));

    const parsedResults = ExaSearchResponseSchema.parse({ results: simplifiedResults });

    return NextResponse.json(parsedResults);
    
  } catch (error) {
    console.error('Error in exasearch API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while performing search';
    return NextResponse.json({ error: `Failed to perform search | ${errorMessage}` }, { status: 500 });
  }
}