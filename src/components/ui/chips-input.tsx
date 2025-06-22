"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChipsInputProps {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  onBlur?: () => void
  name?: string
}

export const ChipsInput = React.forwardRef<HTMLInputElement, ChipsInputProps>(
  ({
    className,
    value = [],
    onValueChange,
    placeholder,
    disabled,
    onBlur,
    name,
    ...props
  }) => {
    const [inputValue, setInputValue] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Add chip on Enter or comma
      if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
        e.preventDefault()
        if (!value.includes(inputValue.trim())) {
          onValueChange([...value, inputValue.trim()])
        }
        setInputValue("")
      }

      // Remove last chip on Backspace if input is empty
      if (e.key === "Backspace" && !inputValue && value.length > 0) {
        onValueChange(value.slice(0, -1))
      }
    }

    const handleRemoveChip = (chipToRemove: string) => {
      onValueChange(value.filter((chip) => chip !== chipToRemove))
      if (onBlur) onBlur()
    }

    const focusInput = () => {
      inputRef.current?.focus()
    }

    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={focusInput}
      >
        {value.map((chip, index) => (
          <div
            key={`${chip}-${index}`}
            className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md"
          >
            <span className="text-sm">{chip}</span>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveChip(chip)
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {chip}</span>
              </Button>
            )}
          </div>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={onBlur}
          name={name}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="flex-1 min-w-[120px] border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
          {...props}
        />
      </div>
    )
  }
)

ChipsInput.displayName = "ChipsInput"
