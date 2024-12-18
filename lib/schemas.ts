// lib/schemas.ts
import { z } from 'zod';

// -----------------------------------
// Extract Claims Schemas
// -----------------------------------
export const ExtractedClaimLLMResponseSchema = z.array(
  z.object({
    claim: z.string().describe("A single, verifiable claim extracted from the text."),
    exact_text: z.string().describe("The exact continuous substring of the original text that contains the claim.")
  })
);

export const ExtractClaimsResponseSchema = z.object({
  claims: z.array(z.object({
    id: z.number(),
    claim: z.string(),
    exact_text: z.string(),
    start: z.number(),
    end: z.number()
  }))
});
export type ExtractClaimsResponse = z.infer<typeof ExtractClaimsResponseSchema>;

export const ExtractClaimsRequestSchema = z.object({
  text: z.string().min(1),
});
export type ExtractClaimsRequest = z.infer<typeof ExtractClaimsRequestSchema>;


// -----------------------------------
// Search Claims Schemas
// -----------------------------------
export const SourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  quote: z.string().optional(),
  relevance: z.number().min(0).max(100).optional(),
  supports: z.boolean().optional()
});
export type Source = z.infer<typeof SourceSchema>;

export const SearchClaimsRequestSchema = z.object({
  claims: z.array(z.object({
    id: z.number(),
    claim: z.string()
  }))
});
export type SearchClaimsRequest = z.infer<typeof SearchClaimsRequestSchema>;

export const SearchClaimsResponseSchema = z.object({
  results: z.array(z.object({
    claimId: z.number(),
    sources: z.array(SourceSchema)
  }))
});
export type SearchClaimsResponse = z.infer<typeof SearchClaimsResponseSchema>;


// -----------------------------------
// Verification Schemas
// -----------------------------------
export const ClaimStatusSchema = z.enum([
  'supported',
  'debated',
  'contradicted',
  'insufficient information'
]);

export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;

export const VerifyClaimsRequestSchema = z.object({
  claims: z.array(z.object({
    claimId: z.number(),
    claim: z.string(),
    sources: z.array(SourceSchema)
  }))
});
export type VerifyClaimsRequest = z.infer<typeof VerifyClaimsRequestSchema>;

export const VerificationResultSchema = z.object({
  claimId: z.number(),
  status: ClaimStatusSchema,
  confidence: z.number().min(0).max(100),
  explanation: z.string(),
  suggestedFix: z.string().optional()
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;

export const VerifyClaimsResponseSchema = z.object({
  verifications: z.array(VerificationResultSchema)
});
export type VerifyClaimsResponse = z.infer<typeof VerifyClaimsResponseSchema>;


// -----------------------------------
// Final Claim Type (Client-side)
// -----------------------------------
export interface Claim {
  id: number;
  exactText: string;
  claim: string;
  start: number;
  end: number;
  status: ClaimStatus | 'not yet verified';
  confidence: number | null;
  explanation: string | null;
  sources: Source[];
  suggestedFix?: string;
}
