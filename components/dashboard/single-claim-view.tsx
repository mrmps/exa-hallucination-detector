import React from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { type Claim } from '@/lib/schemas'
import { ClaimCard } from './claim-card'

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
      
      <ClaimCard
        claim={claim}
        isActive={false}
        isExpanded={true}
        onClick={() => {}}
      />
    </div>
  )
}
