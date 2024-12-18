import { Skeleton } from "@/components/ui/skeleton"

interface ClaimsScaleProps {
  claimsCount: number | null
}

export function ClaimsScale({ claimsCount }: ClaimsScaleProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {claimsCount === null ? (
          <Skeleton className="h-7 w-64" />
        ) : (
          <h2 className="text-xl font-semibold text-gray-900">
            {claimsCount} claims found in this document
          </h2>
        )}
        <p className="text-gray-500 text-sm">
          Click on claims to discover new sources.
        </p>
      </div>
      <div className="flex items-stretch h-2 rounded-full overflow-hidden">
        <div className="bg-emerald-100 flex-1" />
        <div className="bg-emerald-200 flex-1" />
        <div className="bg-amber-200 flex-1" />
        <div className="bg-rose-200 flex-1" />
        <div className="bg-rose-300 flex-1" />
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <h3 className="text-emerald-700 font-semibold">Supported by sources</h3>
        </div>
        <div>
          <h3 className="text-amber-700 font-semibold">Debated by sources</h3>
        </div>
        <div>
          <h3 className="text-rose-700 font-semibold">Contradicted by sources</h3>
        </div>
      </div>
    </div>
  )
}
