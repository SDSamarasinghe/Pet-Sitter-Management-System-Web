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
import { Calendar, Clock, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getUserFromToken } from '@/lib/auth'
import { useProfile, useClients, useSitters } from '@/hooks/useData'
import api from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addDays, eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns'

const SERVICES = [
  { label: 'Pet Sitting 30min - CAD 30', value: 'Pet Sitting 30min', amount: 30 },
  { label: 'Pet Sitting 60min - CAD 46', value: 'Pet Sitting 60min', amount: 46 },
  { label: 'Pet Visit 30min - CAD 30', value: 'Pet Visit 30min', amount: 30 },
  { label: 'Pet Walking 30min - CAD 30', value: 'Pet Walking 30min', amount: 30 },
  { label: 'Pet Walking 60min - CAD 46', value: 'Pet Walking 60min', amount: 46 },
  { label: 'Overnight Stay - CAD 85', value: 'Overnight Stay', amount: 85 },
]

const PET_TYPES = ['Cat(s)', 'Dog(s)', 'Rabbit(s)', 'Bird(s)', 'Guinea pig(s)', 'Ferret(s)', 'Other']

const HOLIDAY_MONTH_DAYS = new Set(['01-01', '07-01', '12-25', '12-26'])

const WEEKEND_SURCHARGE_PCT = 15
const HOLIDAY_SURCHARGE_PCT = 25

/**
 * Times are quoted in the business timezone rather than the browser's, so a
 * client booking while travelling still gets a visit at 8am where the pet is.
 */
const BUSINESS_TIMEZONE_LABEL = 'Eastern Time (Toronto)'

// Radix Select reserves the empty string for "no selection", so an explicit
// "no sitter" choice needs a real value of its own.
const NO_SITTER = 'none'

type VisitSlotTemplate = {
  id: string
  label: string
  startTime: string
  endTime: string
}

type ScheduledVisit = {
  key: string
  date: string
  slotId: string
  label: string
  startTime: string
  endTime: string
  endsNextDay: boolean
}

const DEFAULT_SLOTS: VisitSlotTemplate[] = [
  { id: 'slot-1', label: 'Morning', startTime: '08:00', endTime: '08:30' },
]

let slotCounter = 1
function nextSlotId() {
  slotCounter += 1
  return `slot-${slotCounter}`
}

/** A slot whose end time is at or before its start time runs past midnight. */
function slotEndsNextDay(slot: { startTime: string; endTime: string }) {
  return Boolean(slot.startTime && slot.endTime && slot.endTime <= slot.startTime)
}

function visitKey(date: string, slotId: string) {
  return `${date}|${slotId}`
}

/** Every calendar date in the range, inclusive, as YYYY-MM-DD. */
function listDatesInRange(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate) return []
  try {
    const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
    return days.map((d) => format(d, 'yyyy-MM-dd'))
  } catch {
    return []
  }
}

/**
 * The visits a request actually asks for: every slot on every date in the
 * range, minus the ones the client has unticked. This is what makes
 * "dinner on the 14th through breakfast on the 16th" expressible — the first
 * morning and the last evening are simply left out.
 */
function buildSchedule(
  startDate: string,
  endDate: string,
  slots: VisitSlotTemplate[],
  skipped: Set<string>,
): ScheduledVisit[] {
  const visits: ScheduledVisit[] = []
  for (const date of listDatesInRange(startDate, endDate)) {
    for (const slot of slots) {
      const key = visitKey(date, slot.id)
      if (skipped.has(key)) continue
      visits.push({
        key,
        date,
        slotId: slot.id,
        label: slot.label.trim(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        endsNextDay: slotEndsNextDay(slot),
      })
    }
  }
  return visits.sort((a, b) =>
    `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
  )
}

function visitDayCategory(date: string): 'holiday' | 'weekend' | 'weekday' {
  if (HOLIDAY_MONTH_DAYS.has(date.slice(5))) return 'holiday'
  try {
    return isWeekend(parseISO(date)) ? 'weekend' : 'weekday'
  } catch {
    return 'weekday'
  }
}

/**
 * Cost is per visit, with the weekend / holiday surcharge decided by each
 * visit's own date — two visits on one day therefore cost twice one visit.
 */
function calculateVisitCost(visits: ScheduledVisit[], baseRate: number, pets: number) {
  const safePets = Math.max(1, pets || 1)
  const perVisit = baseRate * safePets
  const weekendPerVisit = Math.round(perVisit * (1 + WEEKEND_SURCHARGE_PCT / 100))
  const holidayPerVisit = Math.round(perVisit * (1 + HOLIDAY_SURCHARGE_PCT / 100))

  let weekday = 0
  let weekend = 0
  let holiday = 0
  for (const visit of visits) {
    const category = visitDayCategory(visit.date)
    if (category === 'holiday') holiday += 1
    else if (category === 'weekend') weekend += 1
    else weekday += 1
  }

  const weekdayCost = weekday * perVisit
  const weekendCost = weekend * weekendPerVisit
  const holidayCost = holiday * holidayPerVisit

  return {
    visitCount: visits.length,
    dayCount: new Set(visits.map((v) => v.date)).size,
    pets: safePets,
    perVisit,
    weekendPerVisit,
    holidayPerVisit,
    breakdown: { weekday, weekend, holiday },
    weekdayCost,
    weekendCost,
    holidayCost,
    total: weekdayCost + weekendCost + holidayCost,
  }
}

function getScheduleWarnings(visits: ScheduledVisit[]) {
  const warnings: string[] = []
  const categories = new Set(visits.map((v) => visitDayCategory(v.date)))
  if (categories.has('weekend')) {
    warnings.push('Weekend dates are included. Weekend rates apply to those visits.')
  }
  if (categories.has('holiday')) {
    warnings.push('Holiday dates are included. Holiday rates apply to those visits.')
  }
  return warnings
}

/** Reasons a schedule cannot be submitted, in the order worth showing them. */
function getScheduleErrors(
  startDate: string,
  endDate: string,
  slots: VisitSlotTemplate[],
  visits: ScheduledVisit[],
): string[] {
  const errors: string[] = []
  if (!startDate || !endDate) return ['Select a start and end date.']
  if (parseISO(endDate) < parseISO(startDate)) {
    errors.push('End date must not be before the start date.')
  }
  if (slots.some((slot) => !slot.startTime || !slot.endTime)) {
    errors.push('Every visit time needs both a start and an end time.')
  }
  if (visits.length === 0) {
    errors.push('Select at least one visit.')
  }

  // No two visits may overlap; the API rejects that too. Compared as instants
  // so an overnight visit clashing with the next morning is caught as well.
  const sorted = [...visits]
    .map((visit) => ({ visit, ...visitBounds(visit) }))
    .sort((a, b) => a.start - b.start)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    if (curr.start < prev.end) {
      errors.push(
        `Two visits overlap: ${format(parseISO(prev.visit.date), 'MMM d')} ` +
          `${prev.visit.startTime}-${prev.visit.endTime} and ` +
          `${format(parseISO(curr.visit.date), 'MMM d')} ` +
          `${curr.visit.startTime}-${curr.visit.endTime}.`,
      )
      break
    }
  }

  return errors
}

/**
 * A visit as comparable timestamps. Only used for ordering and overlap checks,
 * so the browser's own timezone is irrelevant — every visit uses the same one.
 */
function visitBounds(visit: ScheduledVisit) {
  const endDate = visit.endsNextDay ? nextDay(visit.date) : visit.date
  return {
    start: new Date(`${visit.date}T${visit.startTime}:00`).getTime(),
    // Built from the real next date rather than start + 24h, which would be an
    // hour out across a daylight-saving change.
    end: new Date(`${endDate}T${visit.endTime}:00`).getTime(),
  }
}

function nextDay(date: string) {
  return format(addDays(parseISO(date), 1), 'yyyy-MM-dd')
}

/** The schedule as the API's `visitSlots` payload. */
function toVisitSlots(visits: ScheduledVisit[]) {
  return visits.map((visit) => ({
    date: visit.date,
    startTime: visit.startTime,
    endTime: visit.endTime,
    endsNextDay: visit.endsNextDay,
    label: visit.label || undefined,
  }))
}

/** The overall range of a schedule, for the API's startDate / endDate fields. */
function scheduleRange(visits: ScheduledVisit[]) {
  const ordered = [...visits].sort((a, b) => visitBounds(a).start - visitBounds(b).start)
  const first = ordered[0]
  const last = ordered[ordered.length - 1]
  // An overnight last visit ends the following morning.
  const lastEndDate = last.endsNextDay ? nextDay(last.date) : last.date
  return {
    startDate: `${first.date}T${first.startTime}:00`,
    endDate: `${lastEndDate}T${last.endTime}:00`,
  }
}

/**
 * Visit schedule editor shared by the client and admin booking forms.
 *
 * A booking is a set of visits, not a date range with one time on it. The
 * client picks the range, defines the visit times that repeat within it
 * (e.g. Morning and Evening), then unticks any individual visit that is not
 * needed — which is how a stay that starts with dinner and ends with
 * breakfast gets requested.
 */
function VisitScheduleEditor({
  startDate,
  endDate,
  onStartDate,
  onEndDate,
  slots,
  onSlots,
  skipped,
  onSkipped,
  visits,
  errors,
}: {
  startDate: string
  endDate: string
  onStartDate: (value: string) => void
  onEndDate: (value: string) => void
  slots: VisitSlotTemplate[]
  onSlots: (slots: VisitSlotTemplate[]) => void
  skipped: Set<string>
  onSkipped: (skipped: Set<string>) => void
  visits: ScheduledVisit[]
  errors: string[]
}) {
  const dates = listDatesInRange(startDate, endDate)
  // Local date, not UTC: after 8pm Eastern, toISOString() already reads tomorrow
  // and the date input would refuse today.
  const today = format(new Date(), 'yyyy-MM-dd')

  const updateSlot = (id: string, patch: Partial<VisitSlotTemplate>) => {
    onSlots(slots.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)))
  }

  const addSlot = () => {
    const id = nextSlotId()
    onSlots([...slots, { id, label: 'Evening', startTime: '18:00', endTime: '18:30' }])
  }

  const removeSlot = (id: string) => {
    onSlots(slots.filter((slot) => slot.id !== id))
    // Drop any skip entries for the slot that no longer exists.
    const next = new Set(Array.from(skipped).filter((key) => !key.endsWith(`|${id}`)))
    onSkipped(next)
  }

  const toggleVisit = (date: string, slotId: string) => {
    const key = visitKey(date, slotId)
    const next = new Set(skipped)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSkipped(next)
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Visit Schedule
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Set the dates, then the visit times you need on each day. All times are{' '}
          {BUSINESS_TIMEZONE_LABEL}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">First Day *</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDate(e.target.value)}
            min={today}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">Last Day *</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDate(e.target.value)}
            min={startDate || today}
          />
        </div>
      </div>

      {/* Visit times that repeat across the range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Visit Times
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addSlot}>
            <Plus className="h-4 w-4 mr-1" />
            Add a visit time
          </Button>
        </div>

        <div className="space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end border rounded-lg p-3"
            >
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Name</Label>
                <Input
                  value={slot.label}
                  placeholder="e.g. Morning"
                  onChange={(e) => updateSlot(slot.id, { label: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">From</Label>
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(slot.id, { startTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">To</Label>
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(slot.id, { endTime: e.target.value })}
                />
                {slotEndsNextDay(slot) && (
                  <p className="text-xs text-muted-foreground">ends the next morning</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${slot.label || 'visit time'}`}
                disabled={slots.length === 1}
                onClick={() => removeSlot(slot.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Per-day picker — untick any visit that is not needed */}
      {dates.length > 0 && slots.length > 0 && (
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-700">Visits on each day</Label>
            <p className="text-xs text-gray-500 mt-1">
              Untick a visit you do not need — for example no morning visit on the first day.
            </p>
          </div>

          <div className="border rounded-lg divide-y">
            {dates.map((date) => (
              <div
                key={date}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 px-3 py-2 text-sm"
              >
                <span className="w-32 shrink-0 font-medium text-gray-700">
                  {format(parseISO(date), 'EEE, MMM d')}
                </span>
                {slots.map((slot) => (
                  <label key={slot.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!skipped.has(visitKey(date, slot.id))}
                      onCheckedChange={() => toggleVisit(date, slot.id)}
                    />
                    <span>
                      {slot.label || 'Visit'}{' '}
                      <span className="text-muted-foreground">
                        {slot.startTime}-{slot.endTime}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600">
            {visits.length} visit{visits.length === 1 ? '' : 's'} across{' '}
            {new Set(visits.map((v) => v.date)).size} day
            {new Set(visits.map((v) => v.date)).size === 1 ? '' : 's'}.
          </p>
        </div>
      )}

      {startDate && endDate && errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription className="space-y-1 text-sm">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

type AuthUser = { userId: string; role: string; firstName: string }

export default function BookNowPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setAuthUser({ userId: decoded.userId, role: decoded.role, firstName: decoded.firstName })
  }, [])

  // Clients book for themselves and admins book on a client's behalf; sitters
  // have no booking form and go back to their dashboard.
  useEffect(() => {
    if (authUser && authUser.role !== 'client' && authUser.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [authUser, router])

  if (!authUser || (authUser.role !== 'client' && authUser.role !== 'admin')) return null

  const isAdmin = authUser.role === 'admin'

  return (
    <AppLayout>
      <PageShell
        title={isAdmin ? 'Create a Booking' : 'Book Pet Care Services'}
        description={
          isAdmin
            ? 'Schedule pet care on behalf of a client.'
            : 'Schedule your pet sitting, walking, or overnight care services.'
        }
      >
        {isAdmin ? <AdminBookingForm /> : <ClientBookingForm userId={authUser.userId} />}
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
  const [slots, setSlots] = useState<VisitSlotTemplate[]>(DEFAULT_SLOTS)
  const [skipped, setSkipped] = useState<Set<string>>(new Set())
  const [numberOfPets, setNumberOfPets] = useState('1')
  const [petTypes, setPetTypes] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [selectedSitterId, setSelectedSitterId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const assignedSitterId: string | undefined = profile?.assignedSitterId
  const selectedService = SERVICES.find((s) => s.value === service)
  const visits = buildSchedule(startDate, endDate, slots, skipped)
  const scheduleErrors = getScheduleErrors(startDate, endDate, slots, visits)
  const dateWarnings = getScheduleWarnings(visits)

  const togglePetType = (type: string) => {
    setPetTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleCheckAvailability = async () => {
    if (scheduleErrors.length > 0) {
      toast.error(scheduleErrors[0])
      return
    }
    setCheckingAvailability(true)
    try {
      // Checked per visit: a sitter busy at 9am is still free for a 6pm visit.
      const { data } = await api.post('/bookings/available-sitters', {
        visitSlots: toVisitSlots(visits),
        petTypes: petTypes.length > 0 ? petTypes : undefined,
      })
      const sitters = Array.isArray(data) ? data : []
      setAvailableSitters(sitters)
      if (sitters.length === 0) {
        toast.info('No sitters are free for every visit in this schedule.')
      }
    } catch {
      toast.error('Failed to check availability')
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleSubmit = async () => {
    if (!service || petTypes.length === 0) {
      toast.error('Please fill in all required fields and select at least one pet type.')
      return
    }
    if (scheduleErrors.length > 0) {
      toast.error(scheduleErrors[0])
      return
    }
    setSubmitting(true)
    try {
      const range = scheduleRange(visits)
      await api.post('/bookings', {
        serviceType: service,
        ...range,
        // Authoritative schedule: one entry per visit, so a day can hold more than one.
        visitSlots: toVisitSlots(visits),
        numberOfPets: Number(numberOfPets),
        petTypes,
        notes,
        // Rate for a single visit; the API applies each visit's own surcharge.
        totalAmount: (selectedService?.amount ?? 0) * Number(numberOfPets),
        sitterId: selectedSitterId || assignedSitterId || undefined,
      })
      const count = visits.length
      toast.success(
        `Booking submitted with ${count} visit${count === 1 ? '' : 's'}! ` +
          'We will confirm your booking shortly.',
      )
      setService('')
      setStartDate('')
      setEndDate('')
      setSlots(DEFAULT_SLOTS)
      setSkipped(new Set())
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

          {/* Visit Schedule */}
          <div className="space-y-6">
            <VisitScheduleEditor
              startDate={startDate}
              endDate={endDate}
              onStartDate={setStartDate}
              onEndDate={setEndDate}
              slots={slots}
              onSlots={setSlots}
              skipped={skipped}
              onSkipped={setSkipped}
              visits={visits}
              errors={scheduleErrors}
            />

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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          {selectedService && visits.length > 0 && (() => {
            const cost = calculateVisitCost(visits, selectedService.amount, Number(numberOfPets))
            return (
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service rate (per pet / visit)</span>
                  <span className="font-medium">CAD ${selectedService.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of pets</span>
                  <span className="font-medium">{cost.pets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visits</span>
                  <span className="font-medium">
                    {cost.visitCount} across {cost.dayCount} day{cost.dayCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost per visit (weekday)</span>
                  <span className="font-medium">CAD ${cost.perVisit}</span>
                </div>

                {cost.breakdown.weekday > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Weekday visits · {cost.breakdown.weekday} × CAD ${cost.perVisit}
                    </span>
                    <span className="font-medium">CAD ${cost.weekdayCost}</span>
                  </div>
                )}
                {cost.breakdown.weekend > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700">
                      Weekend visits · {cost.breakdown.weekend} × CAD ${cost.weekendPerVisit}
                      <span className="ml-1 text-xs text-amber-600">(+{WEEKEND_SURCHARGE_PCT}%)</span>
                    </span>
                    <span className="font-medium text-amber-800">CAD ${cost.weekendCost}</span>
                  </div>
                )}
                {cost.breakdown.holiday > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-700">
                      Holiday visits · {cost.breakdown.holiday} × CAD ${cost.holidayPerVisit}
                      <span className="ml-1 text-xs text-rose-600">(+{HOLIDAY_SURCHARGE_PCT}%)</span>
                    </span>
                    <span className="font-medium text-rose-800">CAD ${cost.holidayCost}</span>
                  </div>
                )}

                <div className="border-t border-primary/20 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Estimated Total</span>
                  <span className="font-bold text-primary text-lg">CAD ${cost.total}</span>
                </div>
                <p className="text-xs text-gray-500 pt-1">
                  Each visit is charged separately. Weekend rate: +{WEEKEND_SURCHARGE_PCT}%, Holiday rate: +{HOLIDAY_SURCHARGE_PCT}%.
                </p>
              </div>
            )
          })()}

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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
  const [slots, setSlots] = useState<VisitSlotTemplate[]>(DEFAULT_SLOTS)
  const [skipped, setSkipped] = useState<Set<string>>(new Set())
  const [numberOfPets, setNumberOfPets] = useState('1')
  const [petTypes, setPetTypes] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedService = SERVICES.find((s) => s.value === service)
  const visits = buildSchedule(startDate, endDate, slots, skipped)
  const scheduleErrors = getScheduleErrors(startDate, endDate, slots, visits)
  const dateWarnings = getScheduleWarnings(visits)

  const togglePetType = (type: string) => {
    setPetTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSubmit = async () => {
    if (!clientId || !service || petTypes.length === 0) {
      toast.error('Please fill in all required fields.')
      return
    }
    if (scheduleErrors.length > 0) {
      toast.error(scheduleErrors[0])
      return
    }
    setSubmitting(true)
    try {
      const range = scheduleRange(visits)
      await api.post('/bookings/admin', {
        userId: clientId,
        serviceType: service,
        ...range,
        visitSlots: toVisitSlots(visits),
        numberOfPets: Number(numberOfPets),
        petTypes,
        notes,
        // Rate for a single visit; the API applies each visit's own surcharge.
        totalAmount: (selectedService?.amount ?? 0) * Number(numberOfPets),
        sitterId: sitterId || undefined,
      })
      const count = visits.length
      toast.success(`Booking created with ${count} visit${count === 1 ? '' : 's'}.`)
      setClientId('')
      setSitterId('')
      setService('')
      setStartDate('')
      setEndDate('')
      setSlots(DEFAULT_SLOTS)
      setSkipped(new Set())
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
                <Select
                  value={sitterId || NO_SITTER}
                  onValueChange={(value) => setSitterId(value === NO_SITTER ? '' : value)}
                >
                  <SelectTrigger id="sitter">
                    <SelectValue placeholder="No sitter assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SITTER}>No sitter assigned</SelectItem>
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

          {/* Visit Schedule */}
          <div className="space-y-6">
            <VisitScheduleEditor
              startDate={startDate}
              endDate={endDate}
              onStartDate={setStartDate}
              onEndDate={setEndDate}
              slots={slots}
              onSlots={setSlots}
              skipped={skipped}
              onSkipped={setSkipped}
              visits={visits}
              errors={scheduleErrors}
            />

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
          {selectedService && visits.length > 0 && (() => {
            const cost = calculateVisitCost(visits, selectedService.amount, Number(numberOfPets))
            return (
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service rate (per pet / visit)</span>
                  <span className="font-medium">CAD ${selectedService.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of pets</span>
                  <span className="font-medium">{cost.pets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visits</span>
                  <span className="font-medium">
                    {cost.visitCount} across {cost.dayCount} day{cost.dayCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost per visit (weekday)</span>
                  <span className="font-medium">CAD ${cost.perVisit}</span>
                </div>

                {cost.breakdown.weekday > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Weekday visits · {cost.breakdown.weekday} × CAD ${cost.perVisit}
                    </span>
                    <span className="font-medium">CAD ${cost.weekdayCost}</span>
                  </div>
                )}
                {cost.breakdown.weekend > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700">
                      Weekend visits · {cost.breakdown.weekend} × CAD ${cost.weekendPerVisit}
                      <span className="ml-1 text-xs text-amber-600">(+{WEEKEND_SURCHARGE_PCT}%)</span>
                    </span>
                    <span className="font-medium text-amber-800">CAD ${cost.weekendCost}</span>
                  </div>
                )}
                {cost.breakdown.holiday > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-700">
                      Holiday visits · {cost.breakdown.holiday} × CAD ${cost.holidayPerVisit}
                      <span className="ml-1 text-xs text-rose-600">(+{HOLIDAY_SURCHARGE_PCT}%)</span>
                    </span>
                    <span className="font-medium text-rose-800">CAD ${cost.holidayCost}</span>
                  </div>
                )}

                <div className="border-t border-primary/20 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-primary text-lg">CAD ${cost.total}</span>
                </div>
                <p className="text-xs text-gray-500 pt-1">
                  Each visit is charged separately. Weekend rate: +{WEEKEND_SURCHARGE_PCT}%, Holiday rate: +{HOLIDAY_SURCHARGE_PCT}%.
                </p>
              </div>
            )
          })()}

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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
