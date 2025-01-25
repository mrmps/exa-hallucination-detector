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
  // Add .nullable() here to match verification schema
  suggestedFix: z.string().optional().nullable(),
  searchQuery: z.string()
});
export type Claim = z.infer<typeof ClaimSchema>;

// -----------------------------------
// LLM Extraction Schemas
// -----------------------------------
export const LLMExtractedClaimSchema = z.object({
  claim: z.string().describe(
    `COMPLETE STANDALONE CLAIM WITH FULL CONTEXT. MUST:
    1. Be fully self-contained and understandable without source text
    2. Include all necessary context from elsewhere in the document
    3. Replace pronouns with specific nouns/terms
    4. Use full names instead of abbreviations
    5. Make implicit subjects explicit
    6. Contain specific searchable details
    
    FORBIDDEN:
    ❌ Claims requiring original text context
    ❌ Unclear references ("this technique", "the system")
    ❌ Process descriptions ("At query time...")
    ❌ Vague statements without metrics/names
    
    BAD EXAMPLE: "This model handles context efficiently"
    GOOD EXAMPLE: "The Llama 3.1 405B model processes 160,000 tokens of context using grouped attention heads"`
  ),
  exactText: z.string().describe(
    `ORIGINAL TEXT FRAGMENT. MUST:
    1. Be continuous unmodified text from source
    2. Contain the core factual assertion
    3. Not include explanatory context
    4. Be between 5-25 words
    
    FORBIDDEN:
    ❌ Paraphrasing or text recombination
    ❌ Multiple disjoint segments
    ❌ Added commentary
    
    BAD EXAMPLE: "uses... model (see section 3)"
    GOOD EXAMPLE: "uses Llama 3.1 405B with 160K token context"`
  ),
  searchQuery: z.string().describe(
    `VERIFICATION-FOCUSED SEARCH QUESTION. MUST:
    1. Start with "What", "How", "Does", or "Is"
    2. Include full technical names/terms
    3. Specify metrics/numbers when present
    4. Target claim verification
    
    FORMAT EXAMPLES:
    ✅ "What is the token context limit of Llama 3.1 405B?"
    ✅ "How does grouped attention work in Llama models?"
    ✅ "Does Llama 3.1 use 405 billion parameters?"
    
    FORBIDDEN:
    ❌ Generic queries ("Tell me about Llama")
    ❌ Yes/no questions without specifics`
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
// export const LLMCitedSourceSchema = z.object({
//   sourceNumber: z.number().describe('The index number of the source, matching ExaSource sourceNumber'),
//   stance: SourceStanceSchema.describe('Whether this source supports or contradicts the claim'),
//   agreementPercentage: z.number().min(0).max(100).describe('How strongly this source agrees with the claim, from 0-100%'),
//   pertinence: z.number().min(0).max(100).describe('How relevant this source is to the claim topic, from 0-100%'), 
//   relevantSnippet: z.string().describe('The specific text excerpt from the source that relates to the claim')
// });
// export type LLMCitedSource = z.infer<typeof LLMCitedSourceSchema>;

// // LLM verification result for a single claim:
// export const LLMVerificationResultSchema = z.object({
//   status: ClaimStatusSchema.describe('The verification status of the claim: supported, contradicted, debated, or insufficient information'),
//   confidence: z.number().min(0).max(100).describe('Confidence score from 0-100 indicating how confident the verification is'),
//   explanation: z.string().describe('Detailed explanation of the verification result, with source references like {{1}}, {{2}}'),
//   suggestedFix: z.string().optional().describe('If status is contradicted, provides corrected version of the claim text'),
//   citedSources: z.array(LLMCitedSourceSchema).describe('Array of sources cited in the explanation, with stance and relevance metrics'),
//   searchQuery: z.string().describe('The search query used to verify the claim')
// });

export const LLMCitedSourceSchema = z.object({
  sourceNumber: z.number().describe(
    `EXACT source index matching explanation references. MUST:
    1. Correspond precisely to {{n}} markers in explanation
    2. Be sequential starting from 1
    3. Match ExaSource sourceNumber exactly`
  ),
  stance: SourceStanceSchema.describe(
    `Support determination. MUST:
    1. Be true if source directly validates claim
    2. Be false if source contradicts claim
    3. Consider context and nuance
    4. Account for partial/mixed evidence`
  ),
  agreementPercentage: z.number().min(0).max(100).describe(
    `Strength of alignment with claim. MUST:
    1. 100% = Complete unambiguous support
    2. 50% = Partial/mixed evidence
    3. 0% = Direct contradiction
    4. Consider quality of evidence`
  ),
  pertinence: z.number().min(0).max(100).describe(
    `Topical relevance score. MUST:
    1. 100% = Direct discussion of claim subject
    2. 50% = Indirect/contextual relevance
    3. 0% = No relation to claim
    4. Reflect depth of coverage`
  ),
  relevantSnippet: z.string().describe(
    `Verbatim evidence text. MUST:
    1. Be exact quote from source
    2. Contain proving/disproving content
    3. Show critical context
    4. Be 1-3 sentences maximum`
  )
});

export const LLMVerificationResultSchema = z.object({
  status: ClaimStatusSchema.describe(
    `Verification conclusion. MUST BE:
    1. "supported" - Multiple credible sources confirm
    2. "contradicted" - Reliable sources disprove
    3. "debated" - Credible conflicting evidence
    4. "insufficient" - No definitive evidence`
  ),
  confidence: z.number().min(0).max(100).describe(
    `Certainty score. MUST:
    1. 100 = Irrefutable proof
    2. 75 = Strong consensus
    3. 50 = Mixed evidence
    4. 25 = Weak indications
    5. 0 = Complete uncertainty`
  ),
  explanation: z.string().describe(
    `Detailed rationale. MUST:
    1. Cite sources with {{n}} markers
    2. Match ALL sourceNumbers in citedSources
    3. Analyze conflicting evidence
    4. Note evidence quality limitations
    5. Use academic citation style
    
    EXAMPLE: "The claim is supported by NASA's 2023 climate report ({{1}}) showing CO2 levels... However, {{2}} notes measurement discrepancies..."`
  ),
  suggestedFix: z.string().optional().nullable().describe(
    `Corrected claim version. REQUIRED WHEN:
    1. Status = contradicted
    2. Maintain original intent
    3. Incorporate counter-evidence
    4. Use neutral language
    
    MUST BE null when status is not contradicted`
  ),
  citedSources: z.array(LLMCitedSourceSchema).describe(
    `Verified evidence sources. MUST:
    1. Include ALL referenced {{n}} sources
    2. Exclude uncited materials
    3. Order by evidential strength
    4. Contain no duplicate sources`
  ),
  searchQuery: z.string().describe(
    `Original verification query. MUST:
    1. Match exact query used
    2. Show search strategy
    3. Contain key claim terms
    4. Remain unmodified`
  )
});

export type LLMVerificationResult = z.infer<typeof LLMVerificationResultSchema>;
