// lib/schemas.ts
import { z } from 'zod';

// -----------------------------------
// Final Data Structures
// -----------------------------------

export const ClaimStatusSchema = z.enum([
  'supported',
  'debated',
  'contradicted',
  'insufficient information',
  'not yet verified'
]);
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;

export const MergedSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  sourceNumber: z.number(),
  sourceText: z.string(),
  supports: z.boolean(),
  agreementPercentage: z.number().min(0).max(100),
  pertinence: z.number().min(0).max(100)
});
export type MergedSource = z.infer<typeof MergedSourceSchema>;

export const ClaimSchema = z.object({
  id: z.number(),
  exactText: z.string(),
  claim: z.string(),
  start: z.number(),
  end: z.number(),
  status: ClaimStatusSchema,
  confidence: z.number().min(0).max(100).nullable(),
  explanation: z.string().nullable(),
  sources: z.array(MergedSourceSchema),
  suggestedFix: z.string().optional(),
});
export type Claim = z.infer<typeof ClaimSchema>;

// -----------------------------------
// LLM Extraction Schemas
// -----------------------------------

export const LLMExtractedClaimSchema = z.object({
  claim: z.string(),
  exactText: z.string()
});
export type LLMExtractedClaim = z.infer<typeof LLMExtractedClaimSchema>;

export const LLMExtractedClaimsResponseSchema = z.object({
  claims: z.array(z.object({
    ...LLMExtractedClaimSchema.shape,
    start: z.number(),
    end: z.number()
  }))
});
export type LLMExtractedClaimsResponse = z.infer<typeof LLMExtractedClaimsResponseSchema>;

// -----------------------------------
// Combined Search+Verify Step Schemas
// -----------------------------------

// Input to Search+Verify endpoint:
// We assume the claims here come from after extraction and initialization.
// i.e., we know id, exactText, claim, start, end, but not final sources.
// status is 'not yet verified', etc. This endpoint will handle search and verify.
export const SearchAndVerifyRequestSchema = z.object({
  claims: z.array(z.object({
    id: z.number(),
    exactText: z.string(),
    claim: z.string(),
    start: z.number(),
    end: z.number()
  }))
});
export type SearchAndVerifyRequest = z.infer<typeof SearchAndVerifyRequestSchema>;

// Output is final enriched Claim arrays
export const SearchAndVerifyResponseSchema = z.object({
  claims: z.array(ClaimSchema)
});
export type SearchAndVerifyResponse = z.infer<typeof SearchAndVerifyResponseSchema>;

// -----------------------------------
// Intermediate Schemas for Internal Steps
// -----------------------------------

// Exa source (search step result) before merging:
export const ExaSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  sourceNumber: z.number(),
  sourceText: z.string()
});
export type ExaSource = z.infer<typeof ExaSourceSchema>;

// LLM verification cited source (no text fields):
export const LLMCitedSourceSchema = z.object({
  sourceNumber: z.number(),
  supports: z.boolean(),
  agreementPercentage: z.number().min(0).max(100),
  pertinence: z.number().min(0).max(100)
});
export type LLMCitedSource = z.infer<typeof LLMCitedSourceSchema>;

// LLM verification result for a single claim:
export const LLMVerificationResultSchema = z.object({
  status: ClaimStatusSchema,
  confidence: z.number().min(0).max(100),
  explanation: z.string(),
  suggestedFix: z.string().optional(),
  citedSources: z.array(LLMCitedSourceSchema)
});
export type LLMVerificationResult = z.infer<typeof LLMVerificationResultSchema>;
