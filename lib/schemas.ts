import { z } from 'zod';

// Source Schema
export const SourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  quote: z.string().optional(),
  relevance: z.number(),
  supports: z.boolean(),
});

// Sentence Schema
export const SentenceSchema = z.object({
  id: z.number(),
  text: z.string(),
});

// Claim Schema
export const ClaimSchema = z.object({
  id: z.number(),
  sentenceIds: z.array(z.number()),
  text: z.string(),
  status: z.enum(['supported', 'debated', 'contradicted', 'insufficient information']),
  confidence: z.number(),
  explanation: z.string(),
  sources: z.array(SourceSchema),
  suggestedFix: z.string().optional(),
});

// FactCheckerProps Schema
export const FactCheckerPropsSchema = z.object({
  sentences: z.array(SentenceSchema),
  scansLeft: z.number(),
  totalScans: z.number(),
  issuesCount: z.number(),
  claimsCount: z.number(),
  claims: z.array(ClaimSchema),
  submissionId: z.string(),
});

// Request and Response Schemas

// Extract Claims
export const ExtractClaimsRequestSchema = z.object({
  sentences: z.array(z.string()),
});

export const ExtractedClaimSchema = z.object({
  text: z.string(),
  sentenceIds: z.array(z.number()),
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
