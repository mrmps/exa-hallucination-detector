"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface FloatingFactCheckButtonProps {
  onFactCheck: (text: string) => void
}

export function FloatingFactCheckButton({ onFactCheck }: FloatingFactCheckButtonProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedText, setSelectedText] = useState("")

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setPosition(null)
      setSelectedText("")
      return
    }

    const text = selection.toString().trim()
    if (!text) {
      setPosition(null)
      setSelectedText("")
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
    setSelectedText(text)
  }, [])

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [handleSelectionChange])

  if (!position || !selectedText) return null

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
      style={{ left: position.x, top: position.y }}
    >
      <Button
        size="sm"
        className="shadow-lg"
        onClick={() => onFactCheck(selectedText)}
      >
        <Search className="w-4 h-4 mr-2" />
        Fact Check
      </Button>
    </div>
  )
}