import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { type Claim } from '@/lib/types'

interface ClaimCardProps {
  claim: Claim
  onAcceptFix: (claim: Claim) => void
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onAcceptFix }) => {
  const isTrue = claim.status === 'supported'

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${isTrue ? 'bg-green-100' : 'bg-red-100'}`}>
            {isTrue ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">{isTrue ? 'Verified Claim' : 'False Claim'}</h3>
            <p className="text-gray-600 dark:text-gray-300">{claim.text}</p>
          </div>
          <Badge variant="outline" className={`${isTrue ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {claim.confidence}% confident
          </Badge>
        </div>
        <div className="pl-12 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">{claim.explanation}</p>
          {claim.suggestedFix && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Suggested Fix:</p>
              <p className="text-sm text-blue-600 dark:text-blue-300">{claim.suggestedFix}</p>
            </div>
          )}
        </div>
        {claim.suggestedFix && (
          <div className="pl-12">
            <Button onClick={() => onAcceptFix(claim)} className="w-full sm:w-auto">
              Accept Fix
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

