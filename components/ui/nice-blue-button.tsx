import React from 'react'
import { cn } from '@/lib/utils'

interface NiceBlueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export const NiceBlueButton: React.FC<NiceBlueButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      className={cn(
        "group flex h-10 items-center justify-center rounded-md border border-blue-600 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 px-4 text-neutral-50 shadow-[inset_0_1px_0px_0px_#93c5fd] hover:from-blue-600 hover:via-blue-600 hover:to-blue-600 active:[box-shadow:none]",
        className
      )}
    >
      <span className="block group-active:[transform:translate3d(0,1px,0)]">
        {children}
      </span>
    </button>
  )
}