import React from 'react'
import { type MergedSource } from '@/lib/schemas'

interface SourceDetailProps {
  source: MergedSource
}

export function SourceDetail({ source }: SourceDetailProps) {
  const supportsLabel = source.supports ? 'Supports' : 'Does not support';
  const supportsColor = source.supports
    ? 'text-green-700 bg-green-100'
    : 'text-red-700 bg-red-100';

  return (
    <div>
      <div className="flex items-baseline space-x-2">
        <span className="text-gray-600 text-xs font-medium">Source #{source.sourceNumber}</span>
        <span className="text-xs text-gray-500">Pertinence: {source.pertinence}%</span>
        <span className="text-xs text-gray-500">Agreement: {source.agreementPercentage}%</span>
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
      <span className={`inline-block mt-1 text-xs font-medium rounded px-1 ${supportsColor}`}>
        {supportsLabel}
      </span>
    </div>
  );
}

