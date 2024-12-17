import { Claim } from '../lib/types'

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'supported':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'debated':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'contradicted':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getClaimForSentence = (sentenceId: number, claims: Claim[]): Claim | null => {
  return claims.find(claim => claim.sentenceIds.includes(sentenceId)) || null
}

