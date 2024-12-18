// lib/types.ts
import { z } from 'zod';
import * as Schemas from '@/lib/schemas';

// Export Types
export type Source = z.infer<typeof Schemas.SourceSchema>;
export type Sentence = z.infer<typeof Schemas.SentenceSchema>;
export type Claim = z.infer<typeof Schemas.ClaimSchema>;
export type FactCheckerProps = z.infer<typeof Schemas.FactCheckerPropsSchema>;

export type ExtractedClaim = z.infer<typeof Schemas.ExtractedClaimSchema>;
export type ExtractClaimsResponse = z.infer<typeof Schemas.ExtractClaimsResponseSchema>;

export type ExaSearchRequest = z.infer<typeof Schemas.ExaSearchRequestSchema>;
export type ExaResult = z.infer<typeof Schemas.ExaResultSchema>;
export type ExaSearchResponse = z.infer<typeof Schemas.ExaSearchResponseSchema>;

export type VerifiedClaimResponse = z.infer<typeof Schemas.VerifiedClaimResponseSchema>;

export type ClaimStatus = z.infer<typeof Schemas.ClaimStatusSchema>;
