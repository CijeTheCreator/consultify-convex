"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showIcon?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  showIcon = false
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [dropdownPosition, setDropdownPosition] = React.useState<'bottom' | 'top'>('bottom')
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate)
    setOpen(false)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // With the larger modal, we can default to bottom positioning
    // and only switch to top if really needed
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      
      // Only position above if very little space below
      if (spaceBelow < 200) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
    
    setOpen(!open)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal cursor-pointer",
          !date && "text-muted-foreground",
          className
        )}
        disabled={disabled}
        onClick={handleButtonClick}
      >
        {showIcon && <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />}
        <span className="truncate">
          {date ? format(date, "MMM d, yyyy") : placeholder}
        </span>
      </Button>
      
      {open && (
        <div 
          className={cn(
            "absolute left-0 z-50 rounded-md border bg-popover p-0 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 max-h-80 overflow-hidden",
            dropdownPosition === 'bottom' ? "top-full mt-1" : "bottom-full mb-1"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </div>
      )}
    </div>
  )
}
