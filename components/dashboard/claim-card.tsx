// claim-card.tsx

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle } from 'lucide-react'
import { type Claim, type MergedSource } from '@/lib/schemas'
import { SourceDetail } from './source-detail'
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function getStatusStyles(status: Claim['status']) {
  switch (status) {
    case 'supported':
      return { badgeClasses: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Check className="h-3 w-3 text-emerald-700" /> };
    case 'contradicted':
      return { badgeClasses: 'bg-rose-100 text-rose-700 border-rose-200', icon: <X className="h-3 w-3 text-rose-700" /> };
    case 'debated':
      return { badgeClasses: 'bg-amber-100 text-amber-700 border-amber-200', icon: <AlertTriangle className="h-3 w-3 text-amber-700" /> };
    case 'insufficient information':
      return { badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200', icon: <AlertTriangle className="h-3 w-3 text-gray-700" /> };
    default:
      return { badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200', icon: <AlertTriangle className="h-3 w-3 text-gray-700" /> };
  }
}

interface ClaimCardProps {
  claim: Claim
  isActive: boolean
  isExpanded: boolean
  onClick: () => void
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, isActive, isExpanded, onClick }) => {
  const statusStyles = claim?.status ? getStatusStyles(claim.status) : null;

  return (
    <Card
      className={cn(
        "border rounded-md bg-white hover:shadow-md transition-all duration-200 cursor-pointer",
        isActive 
          ? "border-gray-300 ring-2 ring-gray-100 ring-offset-2" 
          : "border-gray-100 hover:border-gray-200"
      )}
      onClick={onClick}
      data-claim-id={claim?.id}
    >
      <CardContent className="p-4">
        {/* Top row: Status and Confidence */}
        <div className="flex items-center space-x-2">
          {!claim?.status ? (
            <Skeleton className="h-3 w-3 rounded-full" />
          ) : (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles?.badgeClasses}`}>
              {statusStyles?.icon}
              <span className="ml-1">{claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}</span>
            </span>
          )}
          {claim?.confidence !== null && (
            <span className="text-xs text-gray-500">
              {claim.confidence}% Confident
            </span>
          )}
        </div>

        {/* Claim text */}
        {claim?.claim ? (
          <h2 className="text-sm font-medium text-gray-900 mt-2">{claim.claim}</h2>
        ) : (
          <Skeleton className="h-4 w-full mt-2" />
        )}

        {/* Explanation */}
        {claim?.explanation ? (
          <p className="text-sm text-gray-700 mt-2">{claim.explanation}</p>
        ) : (
          <Skeleton className="h-4 w-3/4 mt-2" />
        )}

        {/* Suggested Fix */}
        {claim?.suggestedFix && (
          <section aria-label="Suggested fix" className="mt-2 bg-blue-50 p-3 rounded-md">
            <p className="text-xs font-medium text-blue-700">Suggested Fix:</p>
            <p className="text-xs text-blue-600 mt-0.5">{claim.suggestedFix}</p>
          </section>
        )}

        {/* Sources */}
        {isExpanded && claim?.sources && claim.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* We could add a heading for sources if desired:
            <h3 className="text-xs font-medium text-gray-900">Sources</h3>
            */}
            {claim.sources.map((source: MergedSource, index: number) => (
              <SourceDetail key={index} source={source} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
