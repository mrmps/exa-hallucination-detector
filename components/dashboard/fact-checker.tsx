'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { type Claim } from '@/lib/types';
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
import * as Schemas from '@/lib/schemas';
import { VerifiedClaimResponse, ExtractClaimsResponse, ExaSearchResponse, ClaimStatus } from '@/lib/types';

const MAX_CHARACTERS = 5000;

interface FactCheckerProps {
  submissionId: string;
  text: string; // The entire essay text
  // You can still have sentences if needed, but now we rely on text indexing
  // Let's assume we keep sentences array for reference only
  sentences: { id: number; text: string; start: number; end: number; }[];
}

const FactChecker: React.FC<FactCheckerProps> = ({
  submissionId,
  text,
  sentences
}) => {
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [scansLeft, setScansLeft] = useState(5);
  const [totalScans, setTotalScans] = useState(10);

  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<'text' | 'analysis'>('text');
  const [isEditing, setIsEditing] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const [editableText, setEditableText] = useState(text);
  const [copied, setCopied] = useState(false);

  // Derivations
  const filteredClaims = useMemo(() => {
    return claims?.filter((claim) => claim.status !== 'insufficient information') ?? [];
  }, [claims]);

  const claimsNeedingFix = useMemo(() => {
    return filteredClaims.filter((claim) => claim.status === 'contradicted');
  }, [filteredClaims]);

  const falseClaimsCount = claimsNeedingFix.length;
  const trueClaimsCount = filteredClaims.filter(c => c.status === 'supported').length;
  const claimsCount = claims?.length ?? 0;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const extractResponse = await fetch('/api/extractclaims', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentences: editableText.split('\n').map(s => s.trim()).filter(Boolean) }),
        });

        if (!extractResponse.ok) {
          throw new Error(`Failed to extract claims: ${extractResponse.statusText}`);
        }

        const extractedData: ExtractClaimsResponse = await extractResponse.json();
        const parsedExtractedData = Schemas.ExtractClaimsResponseSchema.parse(extractedData);
        const extractedClaims = parsedExtractedData.claims;

        // For each extracted claim, find start/end indices in `editableText`
        const indexedClaims = extractedClaims.map((extractedClaim, index) => {
          const searchStr = extractedClaim.original_text;
          const start = editableText.indexOf(searchStr);
          if (start === -1) {
            // If not found, fallback to insufficient information
            return {
              id: index,
              exactText: searchStr,
              start: 0,
              end: 0,
              status: 'insufficient information' as ClaimStatus,
              confidence: 0,
              explanation: '',
              sources: []
            };
          }
          const end = start + searchStr.length;
          return {
            id: index,
            exactText: searchStr,
            start,
            end,
            // We'll initially mark as insufficient and then verify
            status: 'insufficient information' as ClaimStatus,
            confidence: 0,
            explanation: '',
            sources: []
          };
        });

        // Process claims (exa search + verify)
        const processedClaims = await Promise.all(
          indexedClaims.map(async (c) => {
            if (c.status === 'insufficient information') {
              // Try to verify with exa search
              try {
                const exaResponse = await fetch('/api/exasearch', {
                  method: "POST", 
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ claim: c.exactText }),
                });

                if (!exaResponse.ok) {
                  throw new Error(`ExaSearch failed: ${exaResponse.statusText}`);
                }

                const exaData: ExaSearchResponse = await exaResponse.json();
                const { results: exaResults } = Schemas.ExaSearchResponseSchema.parse(exaData);

                if (exaResults.length === 0) {
                  return c; // remains insufficient info
                }

                // Verify the claim
                const verifyResponse = await fetch('/api/verifyclaims', {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    claim: c.exactText,
                    sources: exaResults,
                  }),
                });

                if (!verifyResponse.ok) {
                  throw new Error(`Claim verification failed: ${verifyResponse.statusText}`);
                }

                const verifiedData: VerifiedClaimResponse = await verifyResponse.json();
                const { claim: verifiedClaim } = Schemas.VerifiedClaimResponseSchema.parse(verifiedData);

                return { ...c, ...verifiedClaim };
              } catch (err) {
                console.error(`Error verifying claim: ${c.exactText}`, err);
                return c; // fallback to insufficient info
              }
            }
            return c;
          })
        );

        setClaims(processedClaims);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [submissionId, editableText]);

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
    // After editing, re-run extraction
    setIsEditing(false);
  };

  const handleUpgrade = () => {
    // Implement upgrade functionality
  };

  const handleBackToText = () => {
    setActiveClaim(null);
    setActiveTab('text');
  };

  // Highlight logic based on start/end indices
  const highlightClaims = useMemo(() => {
    if (isLoading || !claims) {
      return <>{editableText}</>;
    }

    const sortedClaims = [...claims].filter(c => c.start !== c.end).sort((a, b) => a.start - b.start);

    let lastIndex = 0;
    const segments: React.ReactNode[] = [];
    sortedClaims.forEach((claim) => {
      if (claim.start >= 0 && claim.end <= editableText.length && claim.start >= lastIndex) {
        const before = editableText.slice(lastIndex, claim.start);
        if (before) segments.push(<React.Fragment key={`text-${lastIndex}`}>{before}</React.Fragment>);

        const isHighlighted = claim.status !== 'insufficient information';
        const highlightClasses = isHighlighted
          ? claim.status === 'supported'
            ? 'bg-green-50 hover:bg-green-100 dark:bg-green-950/30'
            : claim.status === 'contradicted'
            ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/30'
            : 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30'
          : '';

        const isActive = activeClaim?.id === claim.id;
        const activeRing = isActive
          ? (claim.status === 'supported'
            ? 'bg-green-100 ring-1 ring-green-200'
            : claim.status === 'contradicted'
            ? 'bg-red-100 ring-1 ring-red-200'
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
                  {claim.status === 'supported' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : claim.status === 'contradicted' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : claim.status === 'debated' ? (
                    <HelpCircle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                  )}
                  <p>
                    {claim.status === 'supported'
                      ? 'Verified claim'
                      : claim.status === 'contradicted'
                      ? 'False claim'
                      : claim.status === 'debated'
                      ? 'Debated claim'
                      : 'Insufficient info'}
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
  }, [claims, editableText, activeClaim, isLoading]);

  return (
    <div className="w-full h-full grid grid-rows-[1fr,auto] bg-white border-t border-gray-200 mt-16">
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
                      {isLoading ? (
                        <>
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </>
                      ) : (
                        filteredClaims.map((claim) => (
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

        {/* Desktop Layout with Resizable Panels */}
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
                      {isLoading ? (
                        <>
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </>
                      ) : (
                        filteredClaims.map((claim) => (
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

      {/* Status Bar */}
      <div className="border-t border-gray-100 bg-white">
        <div className="p-2 sm:p-3 flex flex-row items-center justify-between">
          {/* Copy Button */}
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

          {/* Stats and Progress */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Issue Count */}
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <Badge variant="secondary" className="h-6 sm:h-7 shrink-0">
                {falseClaimsCount} {falseClaimsCount === 1 ? 'issue' : 'issues'}
              </Badge>
            )}

            {/* Claims Count */}
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <Badge variant="secondary" className="h-6 sm:h-7 shrink-0">
                {trueClaimsCount} verified
              </Badge>
            )}

            {/* Scans Progress */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isLoading ? (
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

      {/* Text Action Bar (mobile only) */}
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
};

export default FactChecker;
