import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle } from 'lucide-react'
import { Source, type Claim } from '@/lib/types'
import { SourceDetail } from './source-detail'
import { Skeleton } from "@/components/ui/skeleton"

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
  isExpanded: boolean;
  onClick: () => void
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, isActive, isExpanded, onClick }) => {
  const statusStyles = claim?.status ? getStatusStyles(claim.status) : null;

  return (
    <Card
      className={`border border-gray-200 ${
        isActive ? 'ring-2 ring-gray-300 ring-offset-2' : ''
      } cursor-pointer transition-all hover:shadow-md`}
      onClick={onClick}
      data-claim-id={claim?.id}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 p-1 rounded-full bg-white border border-gray-200">
            {!claim?.status ? (
              <Skeleton className="h-3 w-3 rounded-full" />
            ) : (
              statusStyles?.icon
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              {claim?.status ? (
                <Badge variant="outline" className={`px-2 py-0.5 text-xs font-medium border ${statusStyles?.badgeClasses}`}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </Badge>
              ) : (
                <Skeleton className="h-4 w-20" />
              )}
              {claim?.confidence !== null ? (
                <span className="text-xs text-gray-500">{claim.confidence}% Confident</span>
              ) : (
                <Skeleton className="h-4 w-24" />
              )}
            </div>
            {claim?.claim ? (
              <p className="text-sm font-medium text-gray-800 mb-1">{claim.claim}</p>
            ) : (
              <Skeleton className="h-4 w-full mb-1" />
            )}
            {claim?.explanation ? (
              <p className="text-xs text-gray-700">{claim.explanation}</p>
            ) : (
              <Skeleton className="h-4 w-3/4" />
            )}
            {claim?.suggestedFix && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <p className="text-xs font-medium text-blue-700">Suggested Fix:</p>
                <p className="text-xs text-blue-600">{claim.suggestedFix}</p>
              </div>
            )}
          </div>
        </div>
        {isExpanded && claim?.sources && (
          <div className="mt-2 space-y-2">
            {claim.sources.map((source: Source, index: number) => (
              <SourceDetail key={index} source={source} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
