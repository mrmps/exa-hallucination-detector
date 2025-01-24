import { useEffect, useRef } from 'react'
import { Textarea } from "@/components/ui/textarea"

interface EditableTextProps {
  text: string
  onChange: (text: string) => void
  isEditing: boolean
  className?: string
}

export function EditableText({
  text,
  onChange,
  isEditing,
  className = ""
}: EditableTextProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  if (!isEditing) {
    return (
      <pre className={`whitespace-pre-wrap max-w-[80ch] text-base leading-relaxed text-gray-800 ${className}`}>
        {text}
      </pre>
    )
  }

  return (
    <Textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      className={`min-h-[400px] resize-none font-sans text-base leading-relaxed text-gray-800 placeholder-gray-400 border border-gray-300 rounded-md focus:border-gray-400 focus:ring-0 whitespace-pre-wrap max-w-[80ch] ${className}`}
      placeholder="Enter your text here..."
      spellCheck={false}
    />
  )
}
