import { z } from 'zod';

// Source Schema
export const SourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  quote: z.string().optional(),
  relevance: z.number().optional(),
  supports: z.boolean().optional(),
});

// Claim Status Type
export const ClaimStatusSchema = z.enum([
  'supported',
  'debated', 
  'contradicted',
  'insufficient information'
]);

// Claim Schema
// Updated: Using exactText, start, end to locate claim in the essay.
export const ClaimSchema = z.object({
  id: z.number(),
  exactText: z.string(),
  start: z.number(),
  end: z.number(),
  status: ClaimStatusSchema,
  confidence: z.number(),
  explanation: z.string(),
  sources: z.array(SourceSchema),
  suggestedFix: z.string().optional(),
});

// Sentence Schema
export const SentenceSchema = z.object({
  id: z.number(),
  text: z.string(),
  start: z.number(),
  end: z.number(),
});

// FactCheckerProps Schema
// Includes full essay text and claims.
export const FactCheckerPropsSchema = z.object({
  submissionId: z.string(),
  text: z.string(),
  sentences: z.array(SentenceSchema),
  scansLeft: z.number(),
  totalScans: z.number(),
  issuesCount: z.number(),
  claimsCount: z.number(),
  claims: z.array(ClaimSchema),
});

// Request and Response Schemas for Extraction

// Extract Claims
// Updated: LLM returns `claim` and `original_text` for each claim.
export const ExtractedClaimSchema = z.object({
  claim: z.string(),
  original_text: z.string(),
});

export const ExtractClaimsResponseSchema = z.object({
  claims: z.array(ExtractedClaimSchema),
});

// ExaSearch
export const ExaSearchRequestSchema = z.object({
  claim: z.string(),
});

export const ExaResultSchema = z.object({
  url: z.string().url(),
  text: z.string(),
  title: z.string().optional(),
  quote: z.string().optional(),
  relevance: z.number().optional(),
  supports: z.boolean().optional(),
});

export const ExaSearchResponseSchema = z.object({
  results: z.array(ExaResultSchema),
});

// Verified Claim Response Schema
export const VerifiedClaimResponseSchema = z.object({
  claim: ClaimSchema,
});
