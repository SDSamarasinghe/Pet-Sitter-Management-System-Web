'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { Calendar, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getUserFromToken } from '@/lib/auth'
import { useProfile, useClients, useSitters, useAvailableSitters } from '@/hooks/useData'
import api from '@/lib/api'
import Link from 'next/link'
import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns'

const SERVICES = [
  { label: 'Pet Sitting 30min - CAD 28', value: 'Pet Sitting 30min', amount: 28 },
  { label: 'Pet Sitting 60min - CAD 46', value: 'Pet Sitting 60min', amount: 46 },
  { label: 'Pet Visit 30min - CAD 28', value: 'Pet Visit 30min', amount: 28 },
  { label: 'Pet Walking 30min - CAD 28', value: 'Pet Walking 30min', amount: 28 },
  { label: 'Pet Walking 60min - CAD 46', value: 'Pet Walking 60min', amount: 46 },
  { label: 'Overnight Stay - CAD 85', value: 'Overnight Stay', amount: 85 },
]

const PET_TYPES = ['Cat(s)', 'Dog(s)', 'Rabbit(s)', 'Bird(s)', 'Guinea pig(s)', 'Ferret(s)', 'Other']

const HOLIDAY_MONTH_DAYS = new Set(['01-01', '07-01', '12-25', '12-26'])

function isSameDayBooking(startDate: string, endDate: string) {
  return Boolean(startDate && endDate && startDate === endDate)
}

function isValidTimeRange(startDate: string, endDate: string, startTime: string, endTime: string) {
  if (!isSameDayBooking(startDate, endDate)) return true
  return startTime < endTime
}

function getBookingDateWarnings(startDate: string, endDate: string) {
  if (!startDate || !endDate) return []

  try {
    const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
    const warnings: string[] = []

    if (days.some((day) => isWeekend(day))) {
      warnings.push('Weekend dates are included. Weekend rates may apply.')
    }

    if (days.some((day) => HOLIDAY_MONTH_DAYS.has(format(day, 'MM-dd')))) {
      warnings.push('Holiday dates are included. Holiday rates may apply.')
    }

    return warnings
  } catch {
    return []
  }
}

type AuthUser = { userId: string; role: string; firstName: string }

import { useRouter } from 'next/navigation'

export default function BookNowPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setAuthUser({ userId: decoded.userId, role: decoded.role, firstName: decoded.firstName })
  }, [])

  useEffect(() => {
    if (authUser && authUser.role !== 'client') {
      router.replace(authUser.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [authUser, router])

  if (!authUser || authUser.role !== 'client') return null

  return (
    <AppLayout>
      <PageShell title="Book Pet Care Services" description="Schedule your pet sitting, walking, or overnight care services.">
        <ClientBookingForm userId={authUser.userId} />
      </PageShell>
    </AppLayout>
  )
}


// ── Client Booking Form ──────────────────────────────────────────────────────

function ClientBookingForm({ userId }: { userId: string }) {
  const { data: profile } = useProfile()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [availableSitters, setAvailableSitters] = useState<any[]>([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  const [service, setService] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('09:30')
  const [numberOfPets, setNumberOfPets] = useState('1')
  const [petTypes, setPetTypes] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [selectedSitterId, setSelectedSitterId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const assignedSitterId: string | undefined = profile?.assignedSitterId
  const selectedService = SERVICES.find((s) => s.value === service)
  const dateWarnings = getBookingDateWarnings(startDate, endDate)

  const togglePetType = (type: string) => {
    setPetTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates')
      return
    }
    setCheckingAvailability(true)
    try {
      const { data } = await api.get(
        `/bookings/available-sitters?startDate=${startDate}&endDate=${endDate}`
      )
      setAvailableSitters(Array.isArray(data) ? data : [])
      if (data.length === 0) {
        toast.info('No sitters available for these dates')
      }
    } catch (err: unknown) {
      toast.error('Failed to check availability')
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleSubmit = async () => {
    if (!service || !startDate || !endDate || petTypes.length === 0) {
      toast.error('Please fill in all required fields and select at least one pet type.')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date.')
      return
    }
    if (!isValidTimeRange(startDate, endDate, startTime, endTime)) {
      toast.error('For same-day bookings, the end time must be after the start time.')
      return
    }
    if (service === 'Overnight Stay' && startDate === endDate) {
      toast.error('Overnight stay bookings must span at least one night.')
      return
    }
    setSubmitting(true)
    try {
      const startDateTime = `${startDate}T${startTime}:00.000Z`
      const endDateTime = `${endDate}T${endTime}:00.000Z`
      await api.post('/bookings', {
        serviceType: service,
        startDate: startDateTime,
        endDate: endDateTime,
        numberOfPets: Number(numberOfPets),
        petTypes,
        notes,
        totalAmount: (selectedService?.amount ?? 0) * Number(numberOfPets),
        sitterId: selectedSitterId || assignedSitterId || undefined,
      })
      toast.success('Booking submitted! We will confirm your booking shortly.')
      setService('')
      setStartDate('')
      setEndDate('')
      setStartTime('09:00')
      setEndTime('09:30')
      setNumberOfPets('1')
      setPetTypes([])
      setNotes('')
      setSelectedSitterId('')
      setAvailableSitters([])
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to submit booking.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 sm:p-8 space-y-10">
          {/* Service Information */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Service Selection</h2>
              <p className="text-sm text-gray-500 mt-1">Choose your pet care service</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Service Type *</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service Dates & Times */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Service Dates & Times
              </h2>
              <p className="text-sm text-gray-500 mt-1">When do you need care?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time
                </Label>
                <Input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time
                </Label>
                <Input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <p className={`text-xs ${isValidTimeRange(startDate, endDate, startTime, endTime) ? 'text-gray-500' : 'text-destructive'}`}>
              For same-day bookings, the end time must be later than the start time.
            </p>

            {dateWarnings.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertDescription className="space-y-1 text-sm">
                  {dateWarnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {startDate && endDate && (
              <Button
                variant="outline"
                onClick={handleCheckAvailability}
                disabled={checkingAvailability}
                className="w-full"
              >
                {checkingAvailability ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Checking Availability...
                  </>
                ) : (
                  'Check Sitter Availability'
                )}
              </Button>
            )}
          </div>

          {/* Sitter Selection */}
          {availableSitters.length > 0 && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Available Sitters</h2>
                <p className="text-sm text-gray-500 mt-1">Select a preferred sitter (optional)</p>
              </div>

              <div className="grid gap-3">
                {availableSitters.map((sitter: any) => (
                  <label
                    key={sitter._id}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      checked={selectedSitterId === sitter._id}
                      onCheckedChange={() =>
                        setSelectedSitterId(selectedSitterId === sitter._id ? '' : sitter._id)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {sitter.firstName} {sitter.lastName}
                      </p>
                      {sitter.email && <p className="text-xs text-muted-foreground">{sitter.email}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Pet Information */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pet Information</h2>
              <p className="text-sm text-gray-500 mt-1">Tell us about your pets</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPets" className="text-sm font-medium text-gray-700">Number of Pets *</Label>
              <Select value={numberOfPets} onValueChange={setNumberOfPets}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Pet Type(s) *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PET_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={petTypes.includes(type)}
                      onCheckedChange={() => togglePetType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
              <p className="text-sm text-gray-500 mt-1">Any special instructions or details</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Special Care Instructions</Label>
              <Textarea
                id="notes"
                placeholder="Any special care instructions, medications, allergies, or other details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="text-sm"
              />
            </div>
          </div>

          {/* Cost Summary */}
          {selectedService && (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service rate</span>
                <span className="font-medium">CAD ${selectedService.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Number of pets</span>
                <span className="font-medium">{numberOfPets}</span>
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Estimated Total</span>
                <span className="font-bold text-primary text-lg">
                  CAD ${selectedService.amount * Number(numberOfPets)}
                </span>
              </div>
              <p className="text-xs text-gray-500 pt-1">Final cost may vary based on service duration</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Link href="/bookings" className="flex-1">
              <Button variant="outline" className="w-full">
                View My Bookings
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              size="lg"
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Booking Request'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Admin Booking Form ───────────────────────────────────────────────────────

function AdminBookingForm() {
  const { data: clientsData } = useClients()
  const { data: sittersData } = useSitters()

  const clients = Array.isArray(clientsData) ? clientsData : []
  const sitters = Array.isArray(sittersData) ? sittersData : []

  const [clientId, setClientId] = useState('')
  const [sitterId, setSitterId] = useState('')
  const [service, setService] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('09:30')
  const [numberOfPets, setNumberOfPets] = useState('1')
  const [petTypes, setPetTypes] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedService = SERVICES.find((s) => s.value === service)
  const dateWarnings = getBookingDateWarnings(startDate, endDate)

  const togglePetType = (type: string) => {
    setPetTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSubmit = async () => {
    if (!clientId || !service || !startDate || !endDate || petTypes.length === 0) {
      toast.error('Please fill in all required fields.')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date.')
      return
    }
    if (!isValidTimeRange(startDate, endDate, startTime, endTime)) {
      toast.error('For same-day bookings, the end time must be after the start time.')
      return
    }
    if (service === 'Overnight Stay' && startDate === endDate) {
      toast.error('Overnight stay bookings must span at least one night.')
      return
    }
    setSubmitting(true)
    try {
      const startDateTime = `${startDate}T${startTime}:00.000Z`
      const endDateTime = `${endDate}T${endTime}:00.000Z`
      await api.post('/bookings/admin', {
        userId: clientId,
        serviceType: service,
        startDate: startDateTime,
        endDate: endDateTime,
        numberOfPets: Number(numberOfPets),
        petTypes,
        notes,
        totalAmount: (selectedService?.amount ?? 0) * Number(numberOfPets),
        sitterId: sitterId || undefined,
      })
      toast.success('Booking created successfully!')
      setClientId('')
      setSitterId('')
      setService('')
      setStartDate('')
      setEndDate('')
      setStartTime('09:00')
      setEndTime('09:30')
      setNumberOfPets('1')
      setPetTypes([])
      setNotes('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to create booking.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 sm:p-8 space-y-10">
          {/* Client & Sitter Selection */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Client & Sitter</h2>
              <p className="text-sm text-gray-500 mt-1">Choose the client and preferred sitter</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm font-medium text-gray-700">Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c: { _id: string; firstName?: string; lastName?: string; email?: string }) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.firstName} {c.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clientId && (
                  <p className="text-xs text-gray-500">
                    {clients.find((c: { _id: string; email?: string }) => c._id === clientId)?.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitter" className="text-sm font-medium text-gray-700">Sitter (Optional)</Label>
                <Select value={sitterId} onValueChange={setSitterId}>
                  <SelectTrigger id="sitter">
                    <SelectValue placeholder="No sitter assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No sitter assigned</SelectItem>
                    {sitters.map((s: { _id: string; firstName?: string; lastName?: string }) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Service Details</h2>
              <p className="text-sm text-gray-500 mt-1">What service is needed?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service" className="text-sm font-medium text-gray-700">Service Type *</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service Dates & Times */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Service Dates & Times
              </h2>
              <p className="text-sm text-gray-500 mt-1">When is the service needed?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time
                </Label>
                <Input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time
                </Label>
                <Input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <p className={`text-xs ${isValidTimeRange(startDate, endDate, startTime, endTime) ? 'text-gray-500' : 'text-destructive'}`}>
              For same-day bookings, the end time must be later than the start time.
            </p>

            {dateWarnings.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertDescription className="space-y-1 text-sm">
                  {dateWarnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Pet Information */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pet Information</h2>
              <p className="text-sm text-gray-500 mt-1">How many pets and what types?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPets" className="text-sm font-medium text-gray-700">Number of Pets *</Label>
              <Select value={numberOfPets} onValueChange={setNumberOfPets}>
                <SelectTrigger id="numberOfPets">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Pet Type(s) *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PET_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={petTypes.includes(type)}
                      onCheckedChange={() => togglePetType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
              <p className="text-sm text-gray-500 mt-1">Any special notes or instructions</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Special care instructions, medication schedules, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="text-sm"
              />
            </div>
          </div>

          {/* Cost Summary */}
          {selectedService && (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service rate</span>
                <span className="font-medium">CAD ${selectedService.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Number of pets</span>
                <span className="font-medium">{numberOfPets}</span>
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-primary text-lg">
                  CAD ${selectedService.amount * Number(numberOfPets)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Link href="/admin" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              size="lg"
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Booking'
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/bookings">
          <Button variant="ghost" size="sm">View All Bookings</Button>
        </Link>
      </div>
    </div>
  )
}
