import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Claim } from '../../lib/types'
import { SourceDetail } from './source-detail'
import { getStatusColor } from '../../utils/helpers'

interface SingleClaimViewProps {
  claim: Claim
  onBack: () => void
}

export const SingleClaimView: React.FC<SingleClaimViewProps> = ({ claim, onBack }) => {
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className={`border border-zinc-200 bg-white`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className={`mt-0.5 p-1 rounded-full ${getStatusColor(claim.status)}`}>
              {claim.status === 'supported' && <Check className="h-3 w-3" />}
              {claim.status === 'contradicted' && <X className="h-3 w-3" />}
              {claim.status === 'debated' && <AlertTriangle className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className={`${getStatusColor(claim.status)} px-2 py-0.5 text-xs font-medium`}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </Badge>
                <span className="text-xs text-gray-500">{claim.confidence}% Confident</span>
              </div>
              <p className="text-sm font-medium mb-1">{claim.text}</p>
              <p className="text-xs text-gray-600">{claim.explanation}</p>
              {claim.suggestedFix && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs font-medium text-blue-700">Suggested Fix:</p>
                  <p className="text-xs text-blue-600">{claim.suggestedFix}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 space-y-2">
            {claim.sources.map((source, index) => (
              <SourceDetail key={index} source={source} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

