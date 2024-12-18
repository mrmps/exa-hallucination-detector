// lib/types.ts
import { z } from 'zod';
import * as Schemas from '@/lib/schemas';

// Export Types
export type ExaSource = z.infer<typeof Schemas.ExaSourceSchema>;
export type Claim = Schemas.Claim;
export type LLMExtractedClaim = z.infer<typeof Schemas.LLMExtractedClaimSchema>;
export type LLMExtractedClaimsResponse = z.infer<typeof Schemas.LLMExtractedClaimsResponseSchema>;

export type SearchAndVerifyRequest = z.infer<typeof Schemas.SearchAndVerifyRequestSchema>;
export type SearchAndVerifyResponse = z.infer<typeof Schemas.SearchAndVerifyResponseSchema>;

export type LLMVerificationResult = z.infer<typeof Schemas.LLMVerificationResultSchema>;
export type ClaimStatus = z.infer<typeof Schemas.ClaimStatusSchema>;
export type LLMCitedSource = z.infer<typeof Schemas.LLMCitedSourceSchema>;
export type MergedSource = z.infer<typeof Schemas.MergedSourceSchema>;
