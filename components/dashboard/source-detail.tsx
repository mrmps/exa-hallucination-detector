// source-detail.tsx

import React from 'react'
import { type MergedSource } from '@/lib/schemas'

interface SourceDetailProps {
  source: MergedSource
}

export function SourceDetail({ source }: SourceDetailProps) {
  const supportsLabel = source.supports ? 'Supports' : 'Does not support';
  const supportsColor = source.supports ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-gray-600">
        <span className="font-medium">Source #{source.sourceNumber}</span>
        <span className="text-gray-500">Pertinence: {source.pertinence}%</span>
        <span className="text-gray-500">Agreement: {source.agreementPercentage}%</span>
      </div>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm font-medium text-blue-700 hover:underline mt-1"
      >
        {source.title || 'Untitled Source'}
      </a>
      <p className="mt-1 text-sm text-gray-600">
        "{source.sourceText}"
      </p>
      <span className={`inline-block mt-1 rounded px-1 text-xs font-medium ${supportsColor}`}>
        {supportsLabel}
      </span>
    </div>
  );
}
