import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from 'lucide-react'
import { type Source } from '@/lib/types'

interface SourceDetailProps {
  source: Source
}

export function SourceDetail({ source }: SourceDetailProps) {
  return (
    <Card className="p-2 space-y-2 bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
          Relevance: {source.relevance}%
        </Badge>
        {source.supports && (
          <Badge className="bg-green-100 text-green-700 px-2 py-0.5 text-xs">
            Supports claim
          </Badge>
        )}
      </div>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline text-blue-600 flex items-center">
        {source.title}
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
      {source.quote && (
        <blockquote className="border-l-2 pl-2 italic text-gray-600 text-xs">
          "{source.quote}"
        </blockquote>
      )}
    </Card>
  )
}

