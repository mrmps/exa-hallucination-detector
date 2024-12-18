'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { PreviewClaimCard } from './PreviewClaimCard'
import { Copy, CheckCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface Claim {
  claim: string
  assessment: string
  summary: string
  exact_text: string
  fixed_exact_text: string
  confidence_score: number
  url_sources?: string[]
}

interface PreviewBoxProps {
  content: string
  claims: Claim[]
}

const PreviewBox: React.FC<PreviewBoxProps> = ({ content, claims }) => {
  const [displayText, setDisplayText] = useState(content)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [copied, setCopied] = useState(false)

  const filteredClaims = useMemo(() => claims.filter(
    (claim) => claim.assessment.toLowerCase() !== 'insufficient information'
  ), [claims])

  const claimsNeedingFix = useMemo(() => filteredClaims.filter(
    (claim) => claim.assessment.toLowerCase() === 'false'
  ), [filteredClaims])

  const falseClaimsCount = claimsNeedingFix.length
  const trueClaimsCount = filteredClaims.length - falseClaimsCount

  useEffect(() => {
    if (claimsNeedingFix.length > 0 && !selectedClaim) {
      setSelectedClaim(claimsNeedingFix[0])
    }
  }, [claimsNeedingFix, selectedClaim])

  const highlightClaims = useMemo(() => {
    let segments = []
    let lastIndex = 0

    const sortedClaims = [...filteredClaims].sort((a, b) => {
      return displayText.indexOf(a.exact_text) - displayText.indexOf(b.exact_text)
    })

    sortedClaims.forEach((claim) => {
      const index = displayText.indexOf(claim.exact_text, lastIndex)
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

        const isTrue = claim.assessment.toLowerCase().includes('true')
        segments.push(
          <TooltipProvider key={`claim-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`
                    relative cursor-pointer transition-all duration-200
                    ${isTrue ? 
                      'bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50' : 
                      'bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50'
                    }
                    ${selectedClaim === claim ? 
                      isTrue ? 'ring-2 ring-green-500/20' : 'ring-2 ring-red-500/20' 
                      : ''
                    }
                    px-1 py-0.5 rounded-sm
                  `}
                  onClick={() => setSelectedClaim(claim)}
                >
                  {claim.exact_text}
                  <span className={`
                    absolute -top-1 -right-1 w-2 h-2 rounded-full
                    ${isTrue ? 'bg-green-500' : 'bg-red-500'}
                  `} />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  {isTrue ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <p>{isTrue ? 'Verified claim' : 'False claim'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
        lastIndex = index + claim.exact_text.length
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
  }, [displayText, filteredClaims, selectedClaim])

  const acceptFix = (claim: Claim) => {
    setDisplayText(displayText.replace(claim.exact_text, claim.fixed_exact_text))
    
    const currentIndex = claimsNeedingFix.indexOf(claim)
    const nextClaim = claimsNeedingFix[currentIndex + 1]
    setSelectedClaim(nextClaim || null)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b bg-white/50 dark:bg-gray-950/50">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white dark:bg-gray-900">
              {falseClaimsCount} issues found
            </Badge>
            <Badge variant="outline" className="bg-white dark:bg-gray-900">
              {trueClaimsCount} verified claims
            </Badge>
          </div>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {copied ? (
              <span className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                Copied
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Copy text
              </span>
            )}
          </Button>
        </div>
        
        <div 
          className="p-6 min-h-[200px] text-gray-900 dark:text-gray-100 leading-relaxed"
          aria-live="polite"
        >
          {highlightClaims}
        </div>
      </Card>

      {selectedClaim && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms] [animation-fill-mode:forwards]">
          <PreviewClaimCard
            claim={selectedClaim}
            onAcceptFix={acceptFix}
          />
        </div>
      )}
    </div>
  )
}

export default PreviewBox
