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

export const SourceStanceSchema = z.enum([
  'support',
  'contradict',
  'not relevant',
  'unclear'
]);
export type SourceStance = z.infer<typeof SourceStanceSchema>;

export const MergedSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  sourceNumber: z.number(),
  sourceText: z.string(),
  stance: SourceStanceSchema,
  agreementPercentage: z.number().min(0).max(100),
  pertinence: z.number().min(0).max(100),
  relevantSnippet: z.string().optional()
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
  searchQuery: z.string()
});
export type Claim = z.infer<typeof ClaimSchema>;

// -----------------------------------
// LLM Extraction Schemas
// -----------------------------------
export const LLMExtractedClaimSchema = z.object({
  claim: z.string().describe(
    "The extracted claim in a single verifiable statement. Should include all information necessary to verify the statement in isolation."
  ),
  exactText: z.string().describe(
    "The original portion of text that contains the claim. Must be a continuous, uninterrupted sequence from the source text."
  ),
  searchQuery: z.string().describe(
    "A specific question formatted to help verify the claim when searched"
  )
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
    searchQuery: z.string(),
    start: z.number(),
    end: z.number(),
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
  sourceNumber: z.number().describe('The index number of the source, matching ExaSource sourceNumber'),
  stance: SourceStanceSchema.describe('Whether this source supports or contradicts the claim'),
  agreementPercentage: z.number().min(0).max(100).describe('How strongly this source agrees with the claim, from 0-100%'),
  pertinence: z.number().min(0).max(100).describe('How relevant this source is to the claim topic, from 0-100%'), 
  relevantSnippet: z.string().describe('The specific text excerpt from the source that relates to the claim')
});
export type LLMCitedSource = z.infer<typeof LLMCitedSourceSchema>;

// LLM verification result for a single claim:
export const LLMVerificationResultSchema = z.object({
  status: ClaimStatusSchema.describe('The verification status of the claim: supported, contradicted, debated, or insufficient information'),
  confidence: z.number().min(0).max(100).describe('Confidence score from 0-100 indicating how confident the verification is'),
  explanation: z.string().describe('Detailed explanation of the verification result, with source references like {{1}}, {{2}}'),
  suggestedFix: z.string().optional().describe('If status is contradicted, provides corrected version of the claim text'),
  citedSources: z.array(LLMCitedSourceSchema).describe('Array of sources cited in the explanation, with stance and relevance metrics'),
  searchQuery: z.string().describe('The search query used to verify the claim')
});
export type LLMVerificationResult = z.infer<typeof LLMVerificationResultSchema>;
