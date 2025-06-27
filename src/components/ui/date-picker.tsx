"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disablePastDates?: boolean
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pilih tanggal",
  disabled = false,
  className,
  disablePastDates = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(formatDate(date))

  // Update input value when date prop changes
  React.useEffect(() => {
    setValue(formatDate(date))
    if (date) {
      setMonth(date)
    }
  }, [date])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setValue(inputValue)

    // Try to parse various date formats
    const date = new Date(inputValue)
    if (isValidDate(date)) {
      onDateChange(date)
      setMonth(date)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <div className={cn("relative flex gap-2", className)}>
      <Input
        value={value}
        placeholder={placeholder}
        className="bg-background pr-10"
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Pilih tanggal</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate)
              setValue(formatDate(selectedDate))
              setOpen(false)
            }}
            disabled={disablePastDates ? (date) => date < new Date() : undefined}
            locale={id}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
