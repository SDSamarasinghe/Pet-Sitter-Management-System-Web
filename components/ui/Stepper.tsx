'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StepperStep = {
  label: string
  description?: string
}

type StepperProps = {
  steps: StepperStep[]
  /** 1-based index of the active step */
  current: number
  className?: string
}

/**
 * Horizontal numbered stepper with a connecting progress line. The current step
 * is highlighted; completed steps get a check mark; upcoming steps are muted.
 */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn('flex w-full items-start gap-0', className)}>
      {steps.map((step, idx) => {
        const number = idx + 1
        const isComplete = number < current
        const isActive = number === current
        const isLast = idx === steps.length - 1

        return (
          <li
            key={step.label}
            className={cn('relative flex flex-1 items-start', isLast && 'flex-none')}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                  isComplete && 'border-primary bg-primary text-primary-foreground',
                  isActive && 'border-primary text-primary ring-4 ring-primary/15',
                  !isComplete && !isActive && 'border-muted-foreground/30 text-muted-foreground',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete ? <Check className="h-4 w-4" /> : number}
              </div>
              <div className="mt-2 hidden text-center sm:block">
                <p
                  className={cn(
                    'text-xs font-medium leading-tight',
                    isActive || isComplete ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-0.5 max-w-[10rem] text-[10px] leading-tight text-muted-foreground">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {!isLast && (
              <div
                className={cn(
                  'mx-2 mt-4 h-0.5 flex-1 transition-colors',
                  number < current ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
