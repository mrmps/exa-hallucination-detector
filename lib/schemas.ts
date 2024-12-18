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
  'insufficient information',
  'not yet verified',
]);

// Claim Schema
// This is the final form of a claim after merging extraction (exactText, start, end) and verification (status, confidence, explanation).
export const ClaimSchema = z.object({
  id: z.number(),
  exactText: z.string(),
  claim: z.string(),
  start: z.number(),
  end: z.number(),
  status: ClaimStatusSchema,
  confidence: z.number().nullable(),
  explanation: z.string().nullable(),
  sources: z.array(SourceSchema),
  suggestedFix: z.string().optional(),
});

// FactCheckerProps Schema
export const FactCheckerPropsSchema = z.object({
  submissionId: z.string(),
  text: z.string(),
  scansLeft: z.number(),
  totalScans: z.number(),
  issuesCount: z.number(),
  claimsCount: z.number(),
  claims: z.array(ClaimSchema),
});

// Extract Claims
// The extraction step returns claims with 'exact_text' but no verification fields.
export const ExtractedClaimLLMResponseSchema = z.object({
  claim: z.string().describe("The exact claim text extracted by the LLM."),
  exact_text: z.string().describe("The original text from which the claim was extracted."),
}).describe("Schema representing a single claim extracted by the LLM from the provided text.");


// After processing, we add start/end positions
export const ExtractedClaimSchema = z.object({
  claim: z.string(),
  exact_text: z.string(),
  start: z.number(),
  end: z.number(),
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

export const VerifyClaimsLLMResponseSchema = z.object({
  status: z.enum(['supported', 'contradicted', 'insufficient information', 'debated'])
    .describe("The verified status of the claim after analysis by the LLM."),
  confidence: z.number().min(0).max(100).describe("A numeric confidence level (0-100) in the verification status."),
  explanation: z.string().describe("A textual explanation for why the claim was assigned its verification status."),
  suggestedFix: z.string().optional().describe("An optional suggested fix if the claim is incorrect or unclear."),
  sources: z.array(z.object({
    url: z.string().describe("A URL pointing to a source used in claim verification."),
    title: z.string().describe("The title of the source."),
    quote: z.string().describe("A direct quote from the source related to the claim."),
    relevance: z.number().min(0).max(100).describe("A relevance score indicating how closely the source pertains to the claim."),
    supports: z.boolean().describe("Indicates whether the source supports the claim or contradicts it."),
  }).describe("A source used to verify the claim."))
  .describe("An array of sources used to verify the claim and determine its status."),
}).describe("Schema representing the LLM's verification output for a given claim, including status, confidence, and sources.");
