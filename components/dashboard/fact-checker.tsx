'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { type ClaimStatus, type Claim } from '@/lib/types';
import { ExtractClaimsResponseSchema, ExaSearchResponseSchema, VerifyClaimsLLMResponseSchema } from '@/lib/schemas';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, AlertTriangle, HelpCircle, Pencil, Copy, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ClaimsScale } from '@/components/dashboard/claims-scale';
import { ClaimCard } from '@/components/dashboard/claim-card';
import { SingleClaimView } from '@/components/dashboard/single-claim-view';
import { TextActionBar } from '@/components/dashboard/text-action-bar';
import { EditableText } from '@/components/dashboard/editable-text';

import { VerifyClaimsLLMResponse, ExtractClaimsResponse, ExaSearchResponse } from '@/lib/types';

const MAX_CHARACTERS = 5000;

interface FactCheckerProps {
  submissionId: string;
  text: string;
}

export default function FactChecker({ submissionId, text }: FactCheckerProps) {
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const [scansLeft, setScansLeft] = useState(5);
  const [totalScans, setTotalScans] = useState(10);

  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'analysis'>('text');
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState(text);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const extractClaims = async () => {
      try {
        setIsExtracting(true);
        setIsVerifying(false);
        setClaims(null);
        setError(null);

        const extractResponse = await fetch('/api/extractclaims', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editableText }),
        });
        if (!extractResponse.ok) {
          throw new Error(`Failed to extract claims: ${extractResponse.statusText}`);
        }

        const extractedData: ExtractClaimsResponse = await extractResponse.json();
        const parsedExtractedData = ExtractClaimsResponseSchema.parse(extractedData);
        const extractedClaims = parsedExtractedData.claims;

        const initialClaims: Claim[] = extractedClaims.map((extractedClaim, index) => {
          const { start, end, claim } = extractedClaim;
          const exactText = editableText.slice(start, end);

          return {
            id: index,
            exactText,
            claim,
            start,
            end,
            status: 'not yet verified',
            confidence: null,
            explanation: null,
            sources: []
          };
        });

        setClaims(initialClaims);
        setIsExtracting(false);

        // Start verification in background
        verifyClaims(initialClaims);
      } catch (err) {
        console.error("Error extracting claims:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsExtracting(false);
      }
    };
    extractClaims();
  }, [submissionId, editableText]);

  const verifyClaims = async (initialClaims: Claim[]) => {
    try {
      setIsVerifying(true);

      // Process claims in parallel but with rate limiting
      const verifyClaimWithRateLimit = async (claim: Claim, index: number) => {
        try {
          // Stagger initial requests
          await new Promise(resolve => setTimeout(resolve, index * 250));

          const exaResponse = await fetch('/api/exasearch', {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claim: claim.claim }),
          });
          if (!exaResponse.ok) {
            throw new Error(`ExaSearch failed: ${exaResponse.statusText}`);
          }

          const exaData: ExaSearchResponse = await exaResponse.json();
          const { results: exaResults } = ExaSearchResponseSchema.parse(exaData);

          if (exaResults.length === 0) {
            return {
              ...claim,
              status: 'insufficient information' as ClaimStatus,
              explanation: 'No relevant sources were found to verify this claim.'
            };
          }

          const verifyResponse = await fetch('/api/verifyclaims', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              claim: claim.exactText,
              sources: exaResults,
            }),
          });
          if (!verifyResponse.ok) {
            throw new Error(`Claim verification failed: ${verifyResponse.statusText}`);
          }

          const verifiedData: VerifyClaimsLLMResponse = await verifyResponse.json();
          const verifiedClaimData = VerifyClaimsLLMResponseSchema.parse(verifiedData);

          return {
            ...claim,
            status: verifiedClaimData.status,
            confidence: verifiedClaimData.confidence,
            explanation: verifiedClaimData.explanation,
            sources: verifiedClaimData.sources.map(s => ({
              url: s.url,
              title: s.title,
              quote: s.quote,
              relevance: s.relevance,
              supports: s.supports
            })),
            suggestedFix: verifiedClaimData.suggestedFix
          };

        } catch (err) {
          console.error(`Error verifying claim: ${claim.claim}`, err);
          return {
            ...claim,
            status: 'insufficient information' as ClaimStatus,
            explanation: 'Verification failed due to technical issues. Please try again later.'
          };
        }
      };

      // Create verification promises for all claims
      const verificationPromises = initialClaims.map((claim, index) => 
        verifyClaimWithRateLimit(claim, index)
      );

      // Update claims as each verification completes
      for (const verificationPromise of verificationPromises) {
        const verifiedClaim = await verificationPromise;
        setClaims(prevClaims => {
          if (!prevClaims) return [verifiedClaim];
          return prevClaims.map(c => 
            c.id === verifiedClaim.id ? verifiedClaim : c
          );
        });
      }

    } catch (err) {
      console.error("Error verifying claims:", err);
      setError(err instanceof Error ? err.message : "An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const claimsNeedingFix = useMemo(() => {
    return (claims ?? []).filter((claim) => claim.status === 'contradicted');
  }, [claims]);

  const falseClaimsCount = claimsNeedingFix.length;
  const trueClaimsCount = (claims ?? []).filter(c => c.status === 'supported').length;
  const claimsCount = claims ? claims.length : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setActiveClaim(null);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditableText(text);
  };

  const handleScan = () => {
    setIsEditing(false);
  };

  const handleUpgrade = () => { /* Placeholder */ };

  const handleBackToText = () => {
    setActiveClaim(null);
    setActiveTab('text');
  };

  const showClaimsSkeleton = isExtracting || (!claims && isVerifying);

  const highlightClaims = useMemo(() => {
    if (!claims) return <>{editableText}</>;

    const sortedClaims = [...claims].filter(c => c.start !== c.end).sort((a, b) => a.start - b.start);
    let lastIndex = 0;
    const segments: React.ReactNode[] = [];

    sortedClaims.forEach((claim) => {
      if (claim.start >= 0 && claim.end <= editableText.length && claim.start >= lastIndex) {
        const before = editableText.slice(lastIndex, claim.start);
        if (before) segments.push(<React.Fragment key={`text-${lastIndex}`}>{before}</React.Fragment>);

        const unverified = claim.status === 'not yet verified';

        const highlightClasses = unverified
          ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700/30'
          : claim.status === 'supported'
            ? 'bg-green-50 hover:bg-green-100 dark:bg-green-950/30'
            : claim.status === 'contradicted'
              ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/30'
              : claim.status === 'debated'
                ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30'
                : 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30';

        const isActive = activeClaim?.id === claim.id;
        const activeRing = isActive
          ? (unverified
            ? 'bg-gray-300 ring-1 ring-gray-400'
            : claim.status === 'supported'
              ? 'bg-green-100 ring-1 ring-green-200'
              : claim.status === 'contradicted'
                ? 'bg-red-100 ring-1 ring-red-200'
                : claim.status === 'debated'
                  ? 'bg-blue-100 ring-1 ring-blue-200'
                  : 'bg-yellow-100 ring-1 ring-yellow-200')
          : '';

        const claimText = editableText.slice(claim.start, claim.end);

        segments.push(
          <TooltipProvider key={`claim-${claim.id}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  data-claim-id={claim.id}
                  className={`inline transition-colors duration-200 ease-in-out ${highlightClasses} ${activeRing} rounded-sm px-0.5 py-0.5 cursor-pointer`}
                  onClick={() => setActiveClaim(claim)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveClaim(claim);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isActive}
                >
                  {claimText}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  {unverified ? (
                    <AlertTriangle className="w-4 h-4 text-gray-500" />
                  ) : claim.status === 'supported' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : claim.status === 'contradicted' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : claim.status === 'debated' ? (
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <p>
                    {unverified
                      ? 'Not verified yet'
                      : claim.status === 'supported'
                        ? 'Verified claim'
                        : claim.status === 'contradicted'
                          ? 'False claim'
                          : claim.status === 'debated'
                            ? 'Debated claim'
                            : 'Insufficient info'
                    }
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
        lastIndex = claim.end;
      }
    });

    const remaining = editableText.slice(lastIndex);
    if (remaining) segments.push(<React.Fragment key={`text-end`}>{remaining}</React.Fragment>);

    return segments;
  }, [claims, editableText, activeClaim]);

  return (
    <div className="w-full h-full grid grid-rows-[1fr,auto] bg-white border-t border-gray-200 mt-16">
      {/* <div className="fixed bottom-4 right-4 p-2 bg-gray-800 text-xs text-white rounded-lg opacity-50 hover:opacity-100 transition-opacity">
        <div>Claim Count: {claims?.length || 0}</div>
        <div>Active: {activeClaim?.id ?? 'none'}</div>
        <div>Expanded: {expandedClaimId ?? 'none'}</div>
        <div>Tab: {activeTab}</div>
        <div>Editing: {isEditing ? 'yes' : 'no'}</div>
        <div>Extracting: {isExtracting ? 'yes' : 'no'}</div>
        <div>Verifying: {isVerifying ? 'yes' : 'no'}</div>
        <div>Scans: {scansLeft}/{totalScans}</div>
        <div className="mt-2 border-t border-gray-600 pt-2">
          <div className="font-bold mb-1">Claims:</div>
          <pre className="whitespace-pre-wrap overflow-auto max-h-[300px]">
            {JSON.stringify(claims, null, 2)}
          </pre>
        </div>
      </div> */}


      <div className="overflow-hidden">
        {/* Mobile Tabs */}
        <div className="block lg:hidden w-full">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'text' | 'analysis')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="h-[calc(100vh-250px)] overflow-y-auto">
              <div className="p-6 pt-4">
                <div className="flex justify-end mb-4">
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={handleStartEditing} className="gap-2">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <EditableText
                      text={editableText}
                      onChange={setEditableText}
                      isEditing={true}
                    />
                  ) : (
                    highlightClaims
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="analysis" className="h-[calc(100vh-250px)] overflow-y-auto">
              <div className="p-4">
                {activeClaim ? (
                  <SingleClaimView
                    claim={activeClaim}
                    onBack={handleBackToText}
                  />
                ) : (
                  <>
                    <ClaimsScale claimsCount={claimsCount} />
                    <div className="flex justify-between items-center mt-4 mb-2">
                      <h3 className="text-lg font-semibold">Claims</h3>
                    </div>
                    <div className="space-y-3">
                      {error && <div className="text-red-500">{error}</div>}
                      {!claims ? (
                        <>
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </>
                      ) : showClaimsSkeleton ? (
                        <>
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </>
                      ) : (
                        claims.map((claim) => (
                          <ClaimCard
                            key={claim.id}
                            claim={claim}
                            isActive={claim.id === expandedClaimId}
                            isExpanded={claim.id === expandedClaimId}
                            onClick={() => setExpandedClaimId((prevId) => prevId === claim.id ? null : claim.id)}
                          />
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Split View */}
        <div className="hidden lg:flex w-full h-full">
          <ResizablePanelGroup direction="horizontal" className="w-full">
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="p-6 pt-4 h-full grid grid-rows-[auto,1fr,auto]">
                <div className="flex justify-end mb-4">
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartEditing}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>
                <div className="overflow-y-auto">
                  {isEditing ? (
                    <EditableText
                      text={editableText}
                      onChange={setEditableText}
                      isEditing={true}
                    />
                  ) : (
                    highlightClaims
                  )}
                </div>
                {isEditing && (
                  <TextActionBar
                    characterCount={editableText.length}
                    maxCharacters={MAX_CHARACTERS}
                    onCancel={handleCancelEditing}
                    onScan={handleScan}
                    onUpgrade={handleUpgrade}
                  />
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="p-4 h-full overflow-y-auto">
                {activeClaim ? (
                  <SingleClaimView
                    claim={activeClaim}
                    onBack={handleBackToText}
                  />
                ) : (
                  <>
                    <ClaimsScale claimsCount={claimsCount} />
                    <div className="flex justify-between items-center mt-4 mb-2">
                      <h3 className="text-lg font-semibold">Claims</h3>
                    </div>
                    <div className="space-y-3">
                      {error && <div className="text-red-500">{error}</div>}
                      {!claims ? (
                        <>
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </>
                      ) : showClaimsSkeleton ? (
                        <>
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </>
                      ) : (
                        claims.map((claim) => (
                          <ClaimCard
                            key={claim.id}
                            claim={claim}
                            isActive={claim.id === expandedClaimId}
                            isExpanded={claim.id === expandedClaimId}
                            onClick={() =>
                              setExpandedClaimId((prevId) =>
                                prevId === claim.id ? null : claim.id
                              )
                            }
                          />
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-white">
        <div className="p-2 sm:p-3 flex flex-row items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-6 sm:h-7 shrink-0"
          >
            {copied ? (
              <span className="flex items-center gap-1.5">
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copied</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy text</span>
              </span>
            )}
          </Button>
          <div className="flex items-center gap-3 sm:gap-4">
            {(isExtracting || isVerifying) ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <Badge variant="secondary" className="h-6 sm:h-7 shrink-0">
                {falseClaimsCount} {falseClaimsCount === 1 ? 'issue' : 'issues'}
              </Badge>
            )}
            {(isExtracting || isVerifying) ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <Badge variant="secondary" className="h-6 sm:h-7 shrink-0">
                {trueClaimsCount} verified
              </Badge>
            )}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {(isExtracting || isVerifying) ? (
                <>
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-2 w-24" />
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600">
                    {scansLeft}/{totalScans}
                  </span>
                  <Progress
                    value={(scansLeft / totalScans) * 100}
                    className="h-2 sm:h-2.5 w-16 sm:w-24"
                  />
                </>
              )}
              <Button
                variant="link"
                size="sm"
                className="text-sm font-medium text-black h-6 sm:h-7 px-2"
              >
                More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isEditing && activeTab === 'text' && (
        <div className="lg:hidden">
          <TextActionBar
            characterCount={editableText.length}
            maxCharacters={MAX_CHARACTERS}
            onCancel={handleCancelEditing}
            onScan={handleScan}
            onUpgrade={handleUpgrade}
          />
        </div>
      )}
    </div>
  );
}
