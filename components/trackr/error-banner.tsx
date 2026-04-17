"use client"

import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorBannerProps {
  title?: string
  description: string
  onDismiss?: () => void
}

export function ErrorBanner({
  title = "Something went wrong",
  description,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <Alert variant="destructive" className="relative pr-10">
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {onDismiss && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1.5 top-1.5 size-7 text-destructive hover:bg-destructive/10"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </Button>
      )}
    </Alert>
  )
}
