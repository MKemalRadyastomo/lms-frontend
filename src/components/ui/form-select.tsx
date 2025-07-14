'use client'

import * as React from "react"
import { Controller, ControllerProps, FieldPath, FieldValues } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  options: SelectOption[]
  placeholder?: string
  label?: string
  description?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  clearable?: boolean
  loading?: boolean
}

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  options,
  placeholder = "Select an option...",
  label,
  description,
  className,
  triggerClassName,
  contentClassName,
  onValueChange,
  disabled = false,
  clearable = false,
  loading = false,
  ...controllerProps
}: FormSelectProps<TFieldValues, TName>) {
  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState }) => {
        const handleValueChange = (value: string) => {
          // Handle different value types (string, number, etc.)
          const option = options.find(opt => opt.value.toString() === value)
          if (option) {
            // Convert back to original type if needed
            const convertedValue = typeof option.value === 'number' ? option.value : value
            field.onChange(convertedValue)
            onValueChange?.(value)
          }
        }

        const currentValue = field.value?.toString() || ""

        return (
          <div className={cn("space-y-2", className)}>
            {label && (
              <label 
                className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", fieldState.error && "text-destructive")}
              >
                {label}
              </label>
            )}
            <Select
              value={currentValue}
              onValueChange={handleValueChange}
              disabled={disabled || loading}
            >
              <SelectTrigger 
                className={cn(
                  fieldState.error && "border-red-500 focus:border-red-500",
                  triggerClassName
                )}
              >
                <SelectValue placeholder={loading ? "Loading..." : placeholder} />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                {clearable && currentValue && (
                  <SelectItem value="" className="text-muted-foreground">
                    Clear selection
                  </SelectItem>
                )}
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && (
              <p className="text-[0.8rem] text-muted-foreground">
                {description}
              </p>
            )}
            {fieldState.error && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}

// Standalone Select component for non-form usage
interface StandaloneSelectProps {
  options: SelectOption[]
  value?: string | number
  onValueChange?: (value: string | number) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  disabled?: boolean
  clearable?: boolean
  loading?: boolean
}

export function StandaloneSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  clearable = false,
  loading = false,
}: StandaloneSelectProps) {
  const handleValueChange = (selectedValue: string) => {
    const option = options.find(opt => opt.value.toString() === selectedValue)
    if (option) {
      onValueChange?.(option.value)
    }
  }

  const currentValue = value?.toString() || ""

  return (
    <div className={className}>
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={loading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {clearable && currentValue && (
            <SelectItem value="" className="text-muted-foreground">
              Clear selection
            </SelectItem>
          )}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value.toString()}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}