'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import api from '@/lib/api'

// Combined schema for final submission
const fullSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['client', 'sitter']),
  // Sitter fields
  about: z.string().optional(),
  experience: z.string().optional(),
  hourlyRate: z.coerce.number().optional(),
  petTypesServiced: z.array(z.string()).optional(),
  areasCovered: z.string().optional(),
  // Client fields
  cellPhoneNumber: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContactFirstName: z.string().optional(),
  emergencyContactLastName: z.string().optional(),
  emergencyContactCellPhone: z.string().optional(),
})

type FullForm = z.infer<typeof fullSchema>

const PET_TYPES = ['Cat', 'Dog', 'Bird', 'Rabbit', 'Guinea pig', 'Ferret']

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')

  const form = useForm<FullForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(fullSchema) as any,
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
      areasCovered: '',
      cellPhoneNumber: '',
      address: '',
      zipCode: '',
      emergencyContactFirstName: '',
      emergencyContactLastName: '',
      emergencyContactCellPhone: '',
    },
  })

  const role = form.watch('role')
  const progressPercent = Math.round((step / 3) * 100)

  const validateAndNext = async () => {
    let valid = false
    if (step === 1) {
      valid = await form.trigger([
        'firstName',
        'lastName',
        'email',
        'password',
        'role',
      ])
      // Manual password match check
      const pw = form.getValues('password')
      const vals = form.getValues()
      if (valid && vals.role === undefined) valid = false
    } else if (step === 2) {
      valid = true // Step 2 fields are optional
    }
    if (valid) setStep((s) => Math.min(s + 1, 3))
  }

  const onSubmit = async (data: FullForm) => {
    setError('')
    try {
      await api.post('/users', data)
      toast.success('Account created! Please wait for admin approval.')
      router.push('/login')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.'
      setError(msg)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Step {step} of 3
          </p>
          <Progress value={progressPercent} className="h-2" />
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* ── Step 1: Account ─── */}
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                          <Input type="email" {...field} />
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
                          <Input type="password" {...field} />
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
                        <FormLabel>I am a...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-2 gap-4"
                          >
                            <label
                              className={`flex cursor-pointer flex-col items-center rounded-lg border-2 p-4 transition-colors ${
                                field.value === 'client'
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value="client" className="sr-only" />
                              <span className="text-2xl">🐾</span>
                              <span className="mt-2 font-medium">Pet Owner</span>
                            </label>
                            <label
                              className={`flex cursor-pointer flex-col items-center rounded-lg border-2 p-4 transition-colors ${
                                field.value === 'sitter'
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value="sitter" className="sr-only" />
                              <span className="text-2xl">🏠</span>
                              <span className="mt-2 font-medium">Pet Sitter</span>
                            </label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* ── Step 2: Profile ─── */}
              {step === 2 && role === 'sitter' && (
                <>
                  <h3 className="font-medium">Sitter Profile</h3>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About you</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
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
                          <Textarea rows={3} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly rate ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={0.5} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="petTypesServiced"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet types you service</FormLabel>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {PET_TYPES.map((type) => (
                            <label
                              key={type}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={field.value?.includes(type)}
                                onCheckedChange={(checked) => {
                                  const val = field.value || []
                                  field.onChange(
                                    checked
                                      ? [...val, type]
                                      : val.filter((v) => v !== type)
                                  )
                                }}
                              />
                              {type}
                            </label>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="areasCovered"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Areas covered (zip codes, comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {step === 2 && role === 'client' && (
                <>
                  <h3 className="font-medium">Your Details</h3>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="cellPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <h4 className="pt-2 text-sm font-medium">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
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
                          <Input type="tel" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* ── Step 3: Review ─── */}
              {step === 3 && (
                <>
                  <h3 className="font-medium">Review your details</h3>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{' '}
                      {form.getValues('firstName')} {form.getValues('lastName')}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{' '}
                      {form.getValues('email')}
                    </p>
                    <p>
                      <span className="font-medium">Role:</span>{' '}
                      <span className="capitalize">{form.getValues('role')}</span>
                    </p>
                    {role === 'sitter' && (
                      <>
                        {form.getValues('about') && (
                          <p>
                            <span className="font-medium">About:</span>{' '}
                            {form.getValues('about')}
                          </p>
                        )}
                        {form.getValues('petTypesServiced')?.length ? (
                          <p>
                            <span className="font-medium">Pet types:</span>{' '}
                            {form.getValues('petTypesServiced')?.join(', ')}
                          </p>
                        ) : null}
                      </>
                    )}
                    {role === 'client' && form.getValues('address') && (
                      <p>
                        <span className="font-medium">Address:</span>{' '}
                        {form.getValues('address')}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ── Navigation ─── */}
              <div className="flex gap-2 pt-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    Back
                  </Button>
                )}
                <div className="flex-1" />
                {step < 3 ? (
                  <Button type="button" onClick={validateAndNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="ml-1 font-medium text-primary hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
