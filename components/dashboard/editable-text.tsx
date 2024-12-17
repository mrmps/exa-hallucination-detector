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
      <div className={`text-base leading-relaxed text-gray-800 ${className}`}>
        {text}
      </div>
    )
  }

  return (
    <Textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      className={`min-h-[400px] resize-none font-sans text-base leading-relaxed ${className}`}
      placeholder="Enter your text here..."
    />
  )
}

