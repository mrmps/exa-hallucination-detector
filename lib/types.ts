export interface Source {
  url: string;
  title: string;
  quote?: string;
  relevance: number;
  supports: boolean;
}

export interface Sentence {
  id: number;
  text: string;
}

export interface Claim {
  id: number;
  sentenceIds: number[];
  text: string;
  status: 'supported' | 'debated' | 'contradicted' | 'insufficient information';
  confidence: number;
  explanation: string;
  sources: Source[];
  suggestedFix?: string;
}

export interface FactCheckerProps {
  sentences: Sentence[];
  scansLeft: number;
  totalScans: number;
  issuesCount: number;
  claimsCount: number;
  claims: Claim[];
}
