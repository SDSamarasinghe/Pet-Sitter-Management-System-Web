'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  PawPrint,
  Heart,
  ShieldCheck,
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Stepper } from '@/components/ui/Stepper'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

// ─────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────
const fullSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['client', 'sitter'], { message: 'Pick an account type' }),
  // Sitter
  about: z.string().optional(),
  experience: z.string().optional(),
  hourlyRate: z.coerce.number().optional(),
  petTypesServiced: z.array(z.string()).optional(),
  areasCovered: z.array(z.string()).optional(),
  // Client
  cellPhoneNumber: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContactFirstName: z.string().optional(),
  emergencyContactLastName: z.string().optional(),
  emergencyContactCellPhone: z.string().optional(),
})

type FullForm = z.infer<typeof fullSchema>

const PET_TYPES = ['Cat', 'Dog', 'Bird', 'Rabbit', 'Guinea pig', 'Ferret']

const STEPS = [
  { label: 'Account', description: 'Email & password' },
  { label: 'Profile', description: 'About you' },
  { label: 'Review', description: 'Confirm details' },
]

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')

  const form = useForm<FullForm>({
    resolver: zodResolver(fullSchema) as Resolver<FullForm>,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: undefined,
      about: '',
      experience: '',
      hourlyRate: undefined,
      petTypesServiced: [],
      areasCovered: [],
      cellPhoneNumber: '',
      address: '',
      zipCode: '',
      emergencyContactFirstName: '',
      emergencyContactLastName: '',
      emergencyContactCellPhone: '',
    },
  })

  const role = form.watch('role')

  const validateAndNext = async () => {
    if (step === 1) {
      const ok = await form.trigger(['firstName', 'lastName', 'email', 'password', 'role'])
      if (!ok) return
      if (!form.getValues('role')) return
    }
    setStep((s) => Math.min(s + 1, 3))
  }

  const onSubmit = async (data: FullForm) => {
    setError('')
    try {
      const cleaned: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
      }
      if (data.role === 'sitter') {
        cleaned.about = data.about || ''
        cleaned.experience = data.experience || ''
        cleaned.hourlyRate = data.hourlyRate || 0
        cleaned.petTypesServiced = data.petTypesServiced || []
        cleaned.areasCovered = data.areasCovered || []
      } else {
        cleaned.cellPhoneNumber = data.cellPhoneNumber || ''
        cleaned.address = data.address || ''
        cleaned.zipCode = data.zipCode || ''
        cleaned.emergencyContactFirstName = data.emergencyContactFirstName || ''
        cleaned.emergencyContactLastName = data.emergencyContactLastName || ''
        cleaned.emergencyContactCellPhone = data.emergencyContactCellPhone || ''
      }
      await api.post('/users', cleaned)
      toast.success('Account created! Please wait for admin approval.')
      router.push('/login')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.'
      setError(msg)
    }
  }

  // Step-by-step heading
  const stepHeader = (() => {
    if (step === 1) return { title: 'Create your account', description: "Let's start with the basics." }
    if (step === 2)
      return role === 'sitter'
        ? { title: 'Tell us about your services', description: 'This helps clients find the right sitter.' }
        : { title: 'Where should we serve you?', description: 'A few details so sitters can reach you.' }
    return { title: 'Almost done!', description: 'Review your details and submit.' }
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-0 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.4fr)]">
        {/* ─── Hero Panel (left, desktop only) ─── */}
        <aside className="hidden flex-col justify-between bg-gradient-to-br from-primary to-primary/80 p-10 text-primary-foreground lg:flex">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
              <PawPrint className="h-7 w-7" />
              Whiskarz
            </Link>
            <p className="mt-2 text-sm text-primary-foreground/80">Trusted in-home pet care</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Welcome to the Whiskarz family.
            </h2>
            <p className="text-sm text-primary-foreground/80">
              Whether you&apos;re a pet owner looking for caring sitters or an experienced sitter ready
              to grow your business, we&apos;ve got you covered.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="rounded-md bg-white/10 p-2">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Verified & insured sitters</p>
                  <p className="text-xs text-primary-foreground/70">Every sitter is screened.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="rounded-md bg-white/10 p-2">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Real updates from real visits</p>
                  <p className="text-xs text-primary-foreground/70">Photos & notes every day.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="rounded-md bg-white/10 p-2">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Simple, transparent pricing</p>
                  <p className="text-xs text-primary-foreground/70">No surprise fees, ever.</p>
                </div>
              </li>
            </ul>
          </div>

          <p className="text-xs text-primary-foreground/60">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-foreground underline">
              Sign in
            </Link>
          </p>
        </aside>

        {/* ─── Wizard Panel (right) ─── */}
        <main className="flex items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-2xl space-y-6">
            {/* Mobile brand */}
            <div className="lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary">
                <PawPrint className="h-6 w-6" />
                Whiskarz
              </Link>
            </div>

            {/* Stepper */}
            <Stepper steps={STEPS} current={step} />

            <Card className="border-border/60 shadow-sm">
              <CardContent className="space-y-5 p-6 sm:p-8">
                <div>
                  <h1 className="text-xl font-semibold sm:text-2xl">{stepHeader.title}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{stepHeader.description}</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {/* ── Step 1: Account ── */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                  <InputWithIcon icon={User} placeholder="Jane" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <InputWithIcon
                                  icon={Mail}
                                  type="email"
                                  placeholder="you@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <InputWithIcon
                                  icon={Lock}
                                  type="password"
                                  placeholder="At least 8 characters"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>I&apos;m signing up as a…</FormLabel>
                              <FormControl>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <RoleCard
                                    active={field.value === 'client'}
                                    onClick={() => field.onChange('client')}
                                    icon={Heart}
                                    title="Pet Owner"
                                    description="I need someone to care for my pet"
                                  />
                                  <RoleCard
                                    active={field.value === 'sitter'}
                                    onClick={() => field.onChange('sitter')}
                                    icon={PawPrint}
                                    title="Pet Sitter"
                                    description="I want to care for pets"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* ── Step 2: Sitter Profile ── */}
                    {step === 2 && role === 'sitter' && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="about"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>About you</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Share a few sentences about yourself and your experience with pets…"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experience</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Years of experience, certifications, prior roles…"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly rate (CAD)</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} step={0.5} placeholder="e.g. 25" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="petTypesServiced"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pet types you service</FormLabel>
                              <div className="flex flex-wrap gap-2">
                                {PET_TYPES.map((type) => {
                                  const checked = field.value?.includes(type)
                                  return (
                                    <button
                                      key={type}
                                      type="button"
                                      onClick={() => {
                                        const val = field.value || []
                                        field.onChange(
                                          checked ? val.filter((v) => v !== type) : [...val, type],
                                        )
                                      }}
                                      className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                                        checked
                                          ? 'border-primary bg-primary/10 text-primary'
                                          : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/40',
                                      )}
                                    >
                                      {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                                      {type}
                                    </button>
                                  )
                                })}
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="areasCovered"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Areas covered</FormLabel>
                              <FormControl>
                                <InputWithIcon
                                  icon={MapPin}
                                  value={field.value?.join(', ') || ''}
                                  onChange={(e) => {
                                    const areas = e.target.value
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                    field.onChange(areas)
                                  }}
                                  placeholder="e.g. 10001, 10002, 10003"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                Zip codes you&apos;re willing to travel to, separated by commas.
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* ── Step 2: Client Profile ── */}
                    {step === 2 && role === 'client' && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="cellPhoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone number</FormLabel>
                              <FormControl>
                                <InputWithIcon icon={Phone} type="tel" placeholder="+1 (555) 123 4567" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <InputWithIcon icon={MapPin} placeholder="123 Main Street" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zip code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Separator />
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">Emergency Contact</h4>
                          <p className="text-xs text-muted-foreground">
                            Someone we can reach if there&apos;s an issue during a visit.
                          </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="emergencyContactFirstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="emergencyContactLastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="emergencyContactCellPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency contact phone</FormLabel>
                              <FormControl>
                                <InputWithIcon icon={Phone} type="tel" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* ── Step 3: Review ── */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <ReviewSection
                          title="Account"
                          items={[
                            { label: 'Name', value: `${form.getValues('firstName')} ${form.getValues('lastName')}`.trim() },
                            { label: 'Email', value: form.getValues('email') },
                            {
                              label: 'Account type',
                              value: (
                                <Badge variant="outline" className="capitalize">
                                  {form.getValues('role') === 'sitter' ? 'Pet Sitter' : 'Pet Owner'}
                                </Badge>
                              ),
                            },
                          ]}
                        />

                        {role === 'sitter' ? (
                          <ReviewSection
                            title="Sitter Profile"
                            items={[
                              { label: 'About', value: form.getValues('about') || '—' },
                              { label: 'Experience', value: form.getValues('experience') || '—' },
                              {
                                label: 'Hourly rate',
                                value: form.getValues('hourlyRate')
                                  ? `CAD $${form.getValues('hourlyRate')}`
                                  : '—',
                              },
                              {
                                label: 'Pet types',
                                value: form.getValues('petTypesServiced')?.length
                                  ? form.getValues('petTypesServiced')!.join(', ')
                                  : '—',
                              },
                              {
                                label: 'Areas covered',
                                value: form.getValues('areasCovered')?.length
                                  ? form.getValues('areasCovered')!.join(', ')
                                  : '—',
                              },
                            ]}
                          />
                        ) : (
                          <ReviewSection
                            title="Contact"
                            items={[
                              { label: 'Phone', value: form.getValues('cellPhoneNumber') || '—' },
                              { label: 'Address', value: form.getValues('address') || '—' },
                              { label: 'Zip', value: form.getValues('zipCode') || '—' },
                              {
                                label: 'Emergency contact',
                                value:
                                  [form.getValues('emergencyContactFirstName'), form.getValues('emergencyContactLastName')]
                                    .filter(Boolean)
                                    .join(' ') || '—',
                              },
                              {
                                label: 'Emergency phone',
                                value: form.getValues('emergencyContactCellPhone') || '—',
                              },
                            ]}
                          />
                        )}

                        <Alert>
                          <ShieldCheck className="h-4 w-4" />
                          <AlertDescription>
                            By creating an account you agree to our terms. Your account will be
                            reviewed by our team before activation.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* ── Navigation ── */}
                    <div className="flex items-center gap-2 pt-2">
                      {step > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep((s) => s - 1)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                      ) : (
                        <Link href="/login">
                          <Button type="button" variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Sign in instead
                          </Button>
                        </Link>
                      )}
                      <div className="flex-1" />
                      {step < 3 ? (
                        <Button type="button" onClick={validateAndNext}>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account…
                            </>
                          ) : (
                            <>
                              Create account
                              <CheckCircle2 className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground lg:hidden">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Small UI helpers (kept colocated since they're page-specific)
// ─────────────────────────────────────────────────────────

type InputWithIconProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<{ className?: string }>
}

const InputWithIcon = ({ icon: Icon, className, ...props }: InputWithIconProps) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input className={cn('pl-9', className)} {...props} />
  </div>
)

type RoleCardProps = {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

function RoleCard({ active, onClick, icon: Icon, title, description }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all',
        active
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/40 hover:bg-muted/40',
      )}
      aria-pressed={active}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {active && (
        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />
      )}
    </button>
  )
}

type ReviewItem = { label: string; value: React.ReactNode }
function ReviewSection({ title, items }: { title: string; items: ReviewItem[] }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <dl className="grid gap-y-1.5 text-sm sm:grid-cols-[8rem_1fr]">
        {items.map((item) => (
          <div key={item.label} className="contents">
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
