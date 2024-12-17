import { ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface TextActionBarProps {
  characterCount: number
  maxCharacters: number
  onCancel: () => void
  onScan: () => void
  onUpgrade?: () => void
}

export function TextActionBar({
  characterCount,
  maxCharacters,
  onCancel,
  onScan,
  onUpgrade
}: TextActionBarProps) {
  const progress = (characterCount / maxCharacters) * 100
  const isOverLimit = characterCount > maxCharacters

  return (
    <div className="border-t border-gray-100 p-2 flex items-center justify-between gap-4">
      <div className="flex-1 max-w-[200px]">
        <div className="text-sm text-gray-600 mb-1">
          {characterCount.toLocaleString()}/{maxCharacters.toLocaleString()} characters
        </div>
        <Progress 
          value={Math.min(progress, 100)} 
          className="h-1.5"
        >
          <div 
            className={`h-full ${isOverLimit ? 'bg-red-500' : ''}`} 
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </Progress>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onScan}
          disabled={isOverLimit}
          className="gap-2"
        >
          Scan
          <ArrowRight className="w-4 h-4" />
        </Button>
        {onUpgrade && (
          <Button
            variant="outline"
            onClick={onUpgrade}
            className="hidden sm:inline-flex"
          >
            Upgrade Scan
          </Button>
        )}
      </div>
    </div>
  )
}

