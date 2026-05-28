'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PawPrint,
  CalendarHeart,
  ClipboardList,
  Sparkles,
  Heart,
  ShieldCheck,
  CalendarClock,
  MessagesSquare,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/Stepper'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'whiskarz:welcome-seen'

type WizardStep = {
  label: string
  description: string
  /** Headline shown inside the dialog body */
  title: string
  /** Sub-headline shown under the title */
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  /** Primary CTA — when present, navigates the user to relevant page */
  cta?: { href: string; label: string }
  bullets?: Array<{
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
  }>
}

function buildClientSteps(firstName: string): WizardStep[] {
  return [
    {
      label: 'Welcome',
      description: 'A quick tour',
      title: `Welcome to Whiskarz${firstName ? `, ${firstName}` : ''}!`,
      subtitle:
        "We're so happy you joined. Let's get your account set up so you can book trusted pet care in minutes.",
      icon: Sparkles,
      bullets: [
        { icon: ShieldCheck, title: 'Verified sitters', description: 'Every sitter is screened.' },
        { icon: Heart, title: 'Real updates', description: 'Photos & notes from every visit.' },
        { icon: CalendarClock, title: 'Flexible bookings', description: 'Single day or multi-day, you choose.' },
      ],
    },
    {
      label: 'Profile',
      description: 'Complete details',
      title: 'Complete your profile',
      subtitle:
        'Add your address and emergency contact so sitters know where to come and who to reach.',
      icon: ClipboardList,
      cta: { href: '/profile', label: 'Open my profile' },
    },
    {
      label: 'Pets',
      description: 'Add your pets',
      title: 'Add your first pet',
      subtitle:
        'Tell us about each pet — their name, breed, care notes, and a photo. Sitters use this to take great care of them.',
      icon: PawPrint,
      cta: { href: '/pets', label: 'Go to My Pets' },
    },
    {
      label: 'Book',
      description: "You're set",
      title: "You're all set!",
      subtitle:
        'When you need care, just hit Book Now. We\'ll match you with a verified sitter and you can approve the booking.',
      icon: CalendarHeart,
      cta: { href: '/book-now', label: 'Book pet care' },
    },
  ]
}

function buildSitterSteps(firstName: string): WizardStep[] {
  return [
    {
      label: 'Welcome',
      description: 'Get started',
      title: `Welcome aboard${firstName ? `, ${firstName}` : ''}!`,
      subtitle:
        "Thanks for joining Whiskarz as a sitter. A few quick steps and you'll be ready to accept bookings.",
      icon: Sparkles,
      bullets: [
        { icon: Heart, title: 'Build your reputation', description: 'Ratings and reviews from real clients.' },
        { icon: CalendarClock, title: 'You own your schedule', description: 'Set when you’re available.' },
        { icon: MessagesSquare, title: 'Stay in touch', description: 'Message clients directly through the app.' },
      ],
    },
    {
      label: 'Profile',
      description: 'About you',
      title: 'Polish your sitter profile',
      subtitle:
        'A short bio, your experience, and the pet types you’re comfortable with help clients pick you.',
      icon: ClipboardList,
      cta: { href: '/profile', label: 'Open my profile' },
    },
    {
      label: 'Schedule',
      description: 'Availability',
      title: 'Set your availability',
      subtitle:
        'Tell us which days and hours you can take care of pets. You can always update it later.',
      icon: CalendarHeart,
      cta: { href: '/scheduling', label: 'Open scheduling' },
    },
    {
      label: 'Done',
      description: "You're set",
      title: "You're ready to take bookings",
      subtitle:
        'Admins will assign you to bookings matching your skills. Watch your dashboard for upcoming visits.',
      icon: CheckCircle2,
    },
  ]
}

type WelcomeWizardProps = {
  /** The signed-in user — wizard tailors steps by role */
  userId: string
  role: 'client' | 'sitter'
  firstName?: string
  /** Render-controlled override (used when admin re-opens it manually) */
  forceOpen?: boolean
  onClose?: () => void
}

/**
 * First-login welcome wizard. Shown once per user (gated via localStorage) when a
 * client or sitter lands on the dashboard for the first time. Uses the same shadcn
 * Stepper as the signup form for visual consistency.
 */
export function WelcomeWizard({
  userId,
  role,
  firstName,
  forceOpen,
  onClose,
}: WelcomeWizardProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  const steps = useMemo(
    () => (role === 'sitter' ? buildSitterSteps(firstName ?? '') : buildClientSteps(firstName ?? '')),
    [role, firstName],
  )

  // Show automatically on first visit (per-user gate via localStorage). Admin/dev can
  // also drive the open state explicitly via `forceOpen` for re-opens.
  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
      return
    }
    if (typeof window === 'undefined' || !userId) return
    const seenKey = `${STORAGE_KEY}:${userId}`
    if (!localStorage.getItem(seenKey)) {
      setOpen(true)
    }
  }, [userId, forceOpen])

  const markSeen = () => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(`${STORAGE_KEY}:${userId}`, '1')
    }
  }

  const handleClose = (next: boolean) => {
    setOpen(next)
    if (!next) {
      markSeen()
      onClose?.()
    }
  }

  const current = steps[step - 1]
  const isLast = step === steps.length
  const Icon = current.icon

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        {/* Decorative header strip */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 pb-4 text-primary-foreground">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/15 p-2">
                <Icon className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-semibold text-primary-foreground">
                {current.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-primary-foreground/85">
              {current.subtitle}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Stepper + body */}
        <div className="space-y-6 px-6 pb-6 pt-5">
          <Stepper steps={steps.map(({ label, description }) => ({ label, description }))} current={step} />

          <div
            className={cn(
              'min-h-[8rem] rounded-lg border bg-muted/30 p-5',
              current.bullets ? 'space-y-4' : 'flex items-center',
            )}
          >
            {current.bullets ? (
              <ul className="grid gap-4 sm:grid-cols-3">
                {current.bullets.map((b) => {
                  const BIcon = b.icon
                  return (
                    <li key={b.title} className="rounded-md bg-card p-3 shadow-sm">
                      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <BIcon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.description}</p>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex w-full flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="max-w-sm text-sm text-muted-foreground">{current.subtitle}</p>
                {current.cta && (
                  <Link href={current.cta.href}>
                    <Button variant="default" size="sm" onClick={() => handleClose(false)}>
                      {current.cta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between border-t bg-muted/30 px-6 py-4">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
              className="text-muted-foreground"
            >
              Skip tour
            </Button>
          )}

          <p className="hidden text-xs text-muted-foreground sm:block">
            Step {step} of {steps.length}
          </p>

          {isLast ? (
            <Button size="sm" onClick={() => handleClose(false)}>
              Get started
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep((s) => Math.min(s + 1, steps.length))}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
