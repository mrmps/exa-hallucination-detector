"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import {
  LLMExtractedClaimsResponse as ExtractClaimsResponse,
  type Claim,
  SearchAndVerifyResponse,
} from "@/lib/schemas";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ClaimsScale } from "@/components/dashboard/claims-scale";
import { ClaimCard } from "@/components/dashboard/claim-card";
import { SingleClaimView } from "@/components/dashboard/single-claim-view";
import { TextActionBar } from "@/components/dashboard/text-action-bar";
import { EditableText } from "@/components/dashboard/editable-text";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Pencil,
  Copy,
  CheckCheck,
} from "lucide-react";

const MAX_CHARACTERS = 5000;

// Fetchers
async function fetchExtractClaims(
  url: string,
  text: string
): Promise<ExtractClaimsResponse> {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) throw new Error(`Extraction failed: ${resp.statusText}`);
  return resp.json();
}

async function fetchSearchAndVerify(
  url: string,
  extractedClaims: Claim[]
): Promise<SearchAndVerifyResponse> {
  const resp = await fetch("/api/searchandverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      claims: extractedClaims.map((c) => ({
        id: c.id,
        exactText: c.exactText,
        searchQuery: c.searchQuery,
        claim: c.claim,
        start: c.start,
        end: c.end,
      })),
    }),
  });
  if (!resp.ok) throw new Error(`Search and verify failed: ${resp.statusText}`);
  return resp.json();
}

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
};

interface FactCheckerProps {
  submissionId: string;
  text: string;
}

export default function FactChecker({ submissionId, text }: FactCheckerProps) {
  const [editableText, setEditableText] = useState(text);
  const [activeTab, setActiveTab] = useState<"text" | "analysis">("text");
  const [isEditing, setIsEditing] = useState(false);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const [scansLeft, setScansLeft] = useState(5);
  const [totalScans, setTotalScans] = useState(10);

  const hasText = editableText.trim().length > 0;

  // 1. Extract Claims
  const {
    data: extractData,
    error: extractError,
    isLoading: isExtracting,
  } = useSWR(
    hasText ? ["/api/extractclaims", editableText] : null,
    ([url, t]) => fetchExtractClaims(url, t),
    swrOptions
  );
  // Use start and end from extractData
  const extractedClaims: Claim[] | null = useMemo(() => {
    if (!extractData) return null;
    return extractData.claims.map((c, index) => ({
      id: index + 1,
      exactText: c.exactText,
      searchQuery: c.searchQuery, // Add searchQuery field
      claim: c.claim,
      start: c.start,    // use start from extraction
      end: c.end,        // use end from extraction
      status: "not yet verified",
      confidence: null,
      explanation: null,
      sources: [],
    }));
  }, [extractData]);

  // 2. Search and Verify in one step
  const {
    data: searchAndVerifyData,
    error: searchAndVerifyError,
    isLoading: isSearchAndVerifyLoading,
  } = useSWR(
    extractedClaims && extractedClaims.length > 0
      ? ["/api/searchandverify", extractedClaims]
      : null,
    ([url, claims]) => fetchSearchAndVerify(url, claims),
    swrOptions
  );

  const finalClaims: Claim[] | null = useMemo(() => {
    // If searchAndVerifyData is present, use its claims as final
    if (searchAndVerifyData) return searchAndVerifyData.claims;
    // Otherwise fallback to extractedClaims if available
    if (extractedClaims) return extractedClaims;
    return null;
  }, [searchAndVerifyData, extractedClaims]);

  const claims = finalClaims;
  const error =
    extractError?.message || searchAndVerifyError?.message || null;

  const falseClaimsCount = (claims ?? []).filter(
    (c) => c.status === "contradicted"
  ).length;
  const trueClaimsCount = (claims ?? []).filter((c) => c.status === "supported")
    .length;
  const claimsCount = claims ? claims.length : null;

  const isLoadingOverall = isExtracting || isSearchAndVerifyLoading;

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

  const handleUpgrade = () => {
    /* Placeholder */
  };

  const handleBackToText = () => {
    setActiveClaim(null);
    setActiveTab("text");
  };

  const showClaimsSkeleton = isLoadingOverall && !claims;

  const highlightClaims = useMemo(() => {
    if (!claims) return <>{editableText}</>;
    const sortedClaims = [...claims]
      .filter((c) => c.start < c.end)
      .sort((a, b) => a.start - b.start);
    let lastIndex = 0;
    const segments: React.ReactNode[] = [];

    sortedClaims.forEach((claim) => {
      if (
        claim.start >= 0 &&
        claim.end <= editableText.length &&
        claim.start >= lastIndex
      ) {
        const before = editableText.slice(lastIndex, claim.start);
        if (before)
          segments.push(
            <React.Fragment key={`text-${lastIndex}`}>{before}</React.Fragment>
          );

        const unverified = claim.status === "not yet verified";

        const highlightClasses = unverified
          ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700/30"
          : claim.status === "supported"
          ? "bg-green-50 hover:bg-green-100 dark:bg-green-950/30"
          : claim.status === "contradicted"
          ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/30"
          : claim.status === "debated"
          ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30"
          : "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30";

        const isActive = activeClaim?.id === claim.id;
        const activeRing = isActive
          ? `ring-1 ${
              unverified
                ? "ring-gray-300"
                : claim.status === "supported"
                ? "ring-green-300"
                : claim.status === "contradicted"
                ? "ring-red-300"
                : claim.status === "debated"
                ? "ring-blue-300"
                : "ring-yellow-300"
            }`
          : "";

        const claimText = editableText.slice(claim.start, claim.end);

        segments.push(
          <TooltipProvider key={`claim-${claim.id}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  data-claim-id={claim.id}
                  className={`inline transition-colors duration-200 ease-in-out ${highlightClasses} ${activeRing} rounded-sm px-0.5 py-0.5 cursor-pointer`}
                  onClick={() => {
                    if (activeTab === "text") setActiveTab("analysis");
                    setActiveClaim(claim);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (activeTab === "text") setActiveTab("analysis");
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
                  ) : claim.status === "supported" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : claim.status === "contradicted" ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : claim.status === "debated" ? (
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <p>
                    {unverified
                      ? "Not verified yet"
                      : claim.status === "supported"
                      ? "Verified claim"
                      : claim.status === "contradicted"
                      ? "False claim"
                      : claim.status === "debated"
                      ? "Debated claim"
                      : "Insufficient info"}
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
    if (remaining)
      segments.push(
        <React.Fragment key={`text-end`}>{remaining}</React.Fragment>
      );

    return segments;
  }, [claims, editableText, activeClaim, activeTab]);

  return (
    <div className="w-full h-full grid grid-rows-[1fr,auto] bg-white border-t border-gray-200 mt-16">
      <div className="overflow-hidden">
        {/* Mobile Tabs */}
        <div className="block lg:hidden w-full">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "text" | "analysis")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            <TabsContent
              value="text"
              className="h-[calc(100vh-250px)] overflow-y-auto"
            >
              <div className="p-6 pt-4">
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
            <TabsContent
              value="analysis"
              className="h-[calc(100vh-250px)] overflow-y-auto"
            >
              <div className="p-4">
                {activeClaim ? (
                  <SingleClaimView claim={activeClaim} onBack={handleBackToText} />
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
                  <SingleClaimView claim={activeClaim} onBack={handleBackToText} />
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
            {isLoadingOverall ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <Badge variant="secondary" className="h-6 sm:h-7 shrink-0">
                {falseClaimsCount} {falseClaimsCount === 1 ? "issue" : "issues"}
              </Badge>
            )}
            {isLoadingOverall ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <Badge variant="secondary" className="h-6 sm:h-7 shrink-0">
                {trueClaimsCount} verified
              </Badge>
            )}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isLoadingOverall ? (
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

      {isEditing && activeTab === "text" && (
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
