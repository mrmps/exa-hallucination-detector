import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown, ChevronUp, X, AlertTriangle } from 'lucide-react'
import { type Claim } from '@/lib/types'
import { SourceDetail } from './source-detail'
import { getStatusColor } from '@/utils/helpers'
import { Skeleton } from "@/components/ui/skeleton"

interface ClaimCardProps {
  claim: Claim
  isActive: boolean
  isExpanded: boolean;
  onClick: () => void
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, isActive, isExpanded, onClick }) => {
  return (
    <Card 
      className={`border ${
        isActive ? 'ring-2 ring-black ring-offset-2' : ''
      } cursor-pointer transition-all hover:shadow-md`}
      onClick={onClick}
      data-claim-id={claim?.id}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className={`mt-0.5 p-1 rounded-full ${claim?.status ? getStatusColor(claim.status) : ''}`}>
            {!claim?.status ? (
              <Skeleton className="h-3 w-3 rounded-full" />
            ) : claim.status === 'supported' ? (
              <Check className="h-3 w-3" />
            ) : claim.status === 'contradicted' ? (
              <X className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              {claim?.status ? (
                <Badge variant="outline" className={`${getStatusColor(claim.status)} px-2 py-0.5 text-xs font-medium`}>
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
              <p className="text-sm font-medium mb-1">{claim.claim}</p>
            ) : (
              <Skeleton className="h-4 w-full mb-1" />
            )}
            {claim?.explanation ? (
              <p className="text-xs text-gray-600">{claim.explanation}</p>
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
            {claim.sources.map((source, index) => (
              <SourceDetail key={index} source={source} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

