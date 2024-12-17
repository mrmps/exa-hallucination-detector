'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Copy, CheckCheck, AlertTriangle, CheckCircle2, ChevronUp, Pencil, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { type FactCheckerProps, type Claim } from '@/lib/types'
import { ClaimsScale } from '@/components/dashboard/claims-scale'
import { ClaimCard } from '@/components/dashboard/claim-card'
import { SingleClaimView } from '@/components/dashboard/single-claim-view'
import { TextActionBar } from '@/components/dashboard/text-action-bar'
import { EditableText } from '@/components/dashboard/editable-text'

const MAX_CHARACTERS = 5000

const FactChecker: React.FC<FactCheckerProps> = ({ 
  sentences, 
  claims,
  issuesCount,
  claimsCount,
  scansLeft,
  totalScans
}) => {
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null)
  const [expandedClaimId, setExpandedClaimId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'text' | 'analysis'>('text')
  const [isEditing, setIsEditing] = useState(false)
  const [editableText, setEditableText] = useState(sentences.map(s => s.text).join(' '))
  const [copied, setCopied] = useState(false)
  const [selectedClaimFromText, setSelectedClaimFromText] = useState<Claim | null>(null)

  const textRef = useRef<HTMLDivElement>(null)
  const claimsRef = useRef<HTMLDivElement>(null)

  const displayText = sentences.map(s => s.text).join(' ')

  const filteredClaims = useMemo(() => claims.filter(
    (claim) => claim.status !== 'insufficient information'
  ), [claims])

  const claimsNeedingFix = useMemo(() => filteredClaims.filter(
    (claim) => claim.status === 'contradicted'
  ), [filteredClaims])

  const falseClaimsCount = claimsNeedingFix.length
  const trueClaimsCount = filteredClaims.length - falseClaimsCount

  const scrollToActiveElement = (ref: React.RefObject<HTMLDivElement>, selector: string) => {
    if (ref.current) {
      const activeElement = ref.current.querySelector(selector)
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  useEffect(() => {
    if (activeClaim) {
      scrollToActiveElement(textRef, `[data-claim-id="${activeClaim.id}"]`)
      scrollToActiveElement(claimsRef, `[data-claim-id="${activeClaim.id}"]`)
      
      if (window.innerWidth < 1024) { // Mobile view
        setActiveTab('analysis')
      }
    }
  }, [activeClaim])

  const highlightClaims = useMemo(() => {
    let segments = []
    let lastIndex = 0

    const sortedClaims = [...filteredClaims].sort((a, b) => {
      return a.sentenceIds[0] - b.sentenceIds[0]
    })

    sortedClaims.forEach((claim) => {
      const claimSentences = sentences.filter(sentence => claim.sentenceIds.includes(sentence.id))
      const claimText = claimSentences.map(s => s.text).join(' ')
      const index = displayText.indexOf(claimText, lastIndex)
      if (index !== -1) {
        const previousText = displayText.substring(lastIndex, index)
        segments.push(
          previousText.split('\n').map((line, i) => (
            <React.Fragment key={`text-${lastIndex}-${i}`}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))
        )

        const isHighlighted = claim.status !== 'insufficient information'
        segments.push(
          <TooltipProvider key={`claim-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  data-claim-id={claim.id}
                  className={`
                    inline transition-colors duration-200 ease-in-out
                    ${isHighlighted ? 
                      claim.status === 'supported' ?
                        'bg-green-50 hover:bg-green-100 dark:bg-green-950/30' :
                      claim.status === 'contradicted' ?
                        'bg-red-50 hover:bg-red-100 dark:bg-red-950/30' :
                        'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30'
                      : ''
                    }
                    ${activeClaim?.id === claim.id ? 
                      claim.status === 'supported' ?
                        'bg-green-100 ring-1 ring-green-200' :
                      claim.status === 'contradicted' ?
                        'bg-red-100 ring-1 ring-red-200' :
                        'bg-yellow-100 ring-1 ring-yellow-200'
                      : ''
                    }
                    rounded-sm px-0.5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-200
                  `}
                  onClick={() => {
                    setSelectedClaimFromText(claim)
                    setActiveTab('analysis')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedClaimFromText(claim)
                      setActiveTab('analysis')
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={activeClaim?.id === claim.id}
                >
                  {claimText}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  {claim.status === 'supported' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                   claim.status === 'contradicted' ? <AlertTriangle className="w-4 h-4 text-red-500" /> :
                   <HelpCircle className="w-4 h-4 text-yellow-500" />}
                  <p>{claim.status === 'supported' ? 'Verified claim' : 
                      claim.status === 'contradicted' ? 'False claim' : 
                      'Debated claim'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
        lastIndex = index + claimText.length
      }
    })

    const remainingText = displayText.substring(lastIndex)
    segments.push(
      remainingText.split('\n').map((line, i) => (
        <React.Fragment key={`text-end-${i}`}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))
    )

    return segments
  }, [displayText, filteredClaims, activeClaim, sentences, setSelectedClaimFromText, setActiveTab])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartEditing = () => {
    setIsEditing(true)
    setActiveClaim(null)
  }

  const handleCancelEditing = () => {
    setIsEditing(false)
    setEditableText(sentences.map(s => s.text).join(' '))
  }

  const handleScan = () => {
    // TODO: Implement scan functionality
    setIsEditing(false)
  }

  const handleUpgrade = () => {
    // TODO: Implement upgrade functionality
  }

  const handleBackToText = () => {
    setSelectedClaimFromText(null)
    setActiveTab('text')
  }
  return (
    <div className="w-full h-full grid grid-rows-[1fr,auto] bg-white border-t border-gray-200 mt-16">
      <div className="overflow-hidden"> {/* Main content area */}
        {/* Mobile Tabs */}
        <div className="block lg:hidden w-full">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'analysis')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="h-[calc(100vh-250px)] overflow-y-auto">
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
                <div ref={textRef}>
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
                {selectedClaimFromText ? (
                  <SingleClaimView
                    claim={selectedClaimFromText}
                    onBack={handleBackToText}
                  />
                ) : (
                  <>
                    <ClaimsScale claimsCount={claimsCount} />
                    <div className="flex justify-between items-center mt-4 mb-2">
                      <h3 className="text-lg font-semibold">Claims</h3>
                    </div>
                    <div ref={claimsRef} className="space-y-3">
                      {filteredClaims.map((claim) => (
                        <ClaimCard 
                          key={claim.id} 
                          claim={claim}
                          isActive={claim.id === expandedClaimId}
                          isExpanded={claim.id === expandedClaimId}
                          onClick={() => setExpandedClaimId(prevId => prevId === claim.id ? null : claim.id)}
                        />
                      ))}
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
                <div ref={textRef} className="overflow-y-auto">
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
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="p-4 h-full overflow-y-auto">
                {selectedClaimFromText ? (
                  <SingleClaimView
                    claim={selectedClaimFromText}
                    onBack={handleBackToText}
                  />
                ) : (
                  <>
                    <ClaimsScale claimsCount={claimsCount} />
                    <div className="flex justify-between items-center mt-4 mb-2">
                      <h3 className="text-lg font-semibold">Claims</h3>
                    </div>
                    <div ref={claimsRef} className="space-y-3">
                      {filteredClaims.map((claim) => (
                        <ClaimCard 
                          key={claim.id} 
                          claim={claim}
                          isActive={claim.id === expandedClaimId}
                          isExpanded={claim.id === expandedClaimId}
                          onClick={() => setExpandedClaimId(prevId => prevId === claim.id ? null : claim.id)}
                        />
                      ))}
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
            <Badge variant="secondary" className="h-6 sm:h-7 shrink-0">
              {falseClaimsCount} {falseClaimsCount === 1 ? 'issue' : 'issues'}
            </Badge>

            {/* Claims Count */}
            <Badge variant="secondary" className="h-6 sm:h-7 shrink-0">
              {trueClaimsCount} claims
            </Badge>

            {/* Scans Progress */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="text-sm text-gray-600">
                {scansLeft}/{totalScans}
              </span>
              <Progress 
                value={(scansLeft / totalScans) * 100} 
                className="h-2 sm:h-2.5 w-16 sm:w-24" 
              />
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
}

export default FactChecker;