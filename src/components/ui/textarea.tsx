import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-sys-border bg-sys-card px-3 py-2 text-sm ring-offset-sys-bg placeholder:text-sys-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 text-sys-text",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
