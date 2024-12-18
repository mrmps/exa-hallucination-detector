// lib/types.ts
import { z } from 'zod';
import * as Schemas from '@/lib/schemas';

// Export Types
export type Source = z.infer<typeof Schemas.SourceSchema>;
export type Claim = Schemas.Claim; // Use interface defined in schemas.ts
export type ExtractClaimsRequest = z.infer<typeof Schemas.ExtractClaimsRequestSchema>;
export type ExtractClaimsResponse = z.infer<typeof Schemas.ExtractClaimsResponseSchema>;
export type ExtractedClaimLLMResponse = z.infer<typeof Schemas.ExtractedClaimLLMResponseSchema>;

export type SearchClaimsRequest = z.infer<typeof Schemas.SearchClaimsRequestSchema>;
export type SearchClaimsResponse = z.infer<typeof Schemas.SearchClaimsResponseSchema>;

export type VerifyClaimsRequest = z.infer<typeof Schemas.VerifyClaimsRequestSchema>;
export type VerifyClaimsResponse = z.infer<typeof Schemas.VerifyClaimsResponseSchema>;
export type VerificationResult = z.infer<typeof Schemas.VerificationResultSchema>;

export type ClaimStatus = z.infer<typeof Schemas.ClaimStatusSchema>;
