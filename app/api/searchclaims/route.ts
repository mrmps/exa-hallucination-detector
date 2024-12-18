import { NextRequest, NextResponse } from 'next/server';
import { SearchClaimsRequestSchema, SearchClaimsResponseSchema, SourceSchema } from '@/lib/schemas';
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { claims } = SearchClaimsRequestSchema.parse(json);

    // Perform searches in parallel, but allow some to fail gracefully
    const searchPromises = claims.map(async (c) => {
      const result = await exa.searchAndContents(
        `Query: ${c.claim}\nFind pages that can verify this claim:`,
        {
          type: "auto",
          numResults: 3,
          livecrawl: 'always',
          text: true,
        }
      );

      const sources = result.results.map((item: any) => ({
        url: item.url,
        title: item.title,
        quote: item.quote || (item.text || '').slice(0, 200),
        relevance: item.relevance,
        supports: item.supports,
      }));

      // Validate sources according to schema
      sources.forEach((src: unknown, idx: number) => {
        // If invalid, this will throw and be caught by allSettled
        SourceSchema.parse(src);
      });

      return { claimId: c.id, sources };
    });

    // Use allSettled to handle partial failures
    const settledResults = await Promise.allSettled(searchPromises);

    const results = settledResults.map((res, index) => {
      if (res.status === 'fulfilled') {
        return res.value;
      } else {
        // Log the error for the failed claim
        console.error(`Search error for claim "${claims[index].claim}":`, res.reason);
        // Return an empty source array or handle differently if needed
        return { claimId: claims[index].id, sources: [] };
      }
    });

    const parsed = SearchClaimsResponseSchema.parse({ results });
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Error in searchclaims API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Search failed: ${message}` }, { status: 500 });
  }
}
