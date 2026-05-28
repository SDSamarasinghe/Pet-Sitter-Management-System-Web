import useSWR from 'swr'
import api from '@/lib/api'

const fetcher = (url: string) => api.get(url).then((r) => r.data)

export type PaginatedParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  formStatus?: string
  from?: string
  to?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function toQueryString(params: PaginatedParams) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.set(k, String(v))
  })
  return qs.toString()
}

function usePaginatedFetch<T = any>(base: string, params: PaginatedParams) {
  const qs = toQueryString({ page: 1, limit: 10, ...params })
  const url = `${base}?${qs}`
  const swr = useSWR<PaginatedResponse<T>>(url, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })
  return swr
}

// ── User / Profile ─────────────────────────────────────
export function useProfile() {
  return useSWR('/users/profile', fetcher)
}

export function usePendingUsers() {
  return useSWR('/users/pending', fetcher)
}

export function useClients() {
  return useSWR('/users/admin/clients', fetcher)
}

export function useClientsWithPets() {
  return useSWR('/users/admin/clients-with-pets', fetcher)
}

export function useSitters() {
  return useSWR('/users/admin/sitters', fetcher)
}

// ── Bookings ────────────────────────────────────────────
export function useBookings(role: string, userId: string) {
  let endpoint: string | null = null
  if (role === 'admin') {
    endpoint = '/bookings'
  } else if (role === 'sitter' && userId) {
    endpoint = `/bookings/sitter/${userId}`
  } else if (role && userId) {
    endpoint = `/bookings/user/${userId}`
  }
  return useSWR(endpoint, fetcher)
}

export function useBooking(id: string) {
  return useSWR(id ? `/bookings/${id}` : null, fetcher)
}

export function useBookingGroupDetail(id: string) {
  return useSWR(id ? `/bookings/${id}/group-detail` : null, fetcher)
}

export function useGroupedBookings() {
  return useSWR('/bookings/grouped', fetcher)
}

export function useUserGroupedBookings(userId: string) {
  return useSWR(userId ? `/bookings/user/${userId}/grouped` : null, fetcher)
}

export function useSitterGroupedBookings(sitterId: string) {
  return useSWR(sitterId ? `/bookings/sitter/${sitterId}/grouped` : null, fetcher)
}

// ── Paginated admin hooks ───────────────────────────────
export function usePaginatedClients(params: PaginatedParams) {
  return usePaginatedFetch('/users/admin/clients', params)
}

export function usePaginatedSitters(params: PaginatedParams) {
  return usePaginatedFetch('/users/admin/sitters', params)
}

export function usePaginatedPets(params: PaginatedParams) {
  return usePaginatedFetch('/pets', params)
}

export function usePaginatedBookings(params: PaginatedParams) {
  return usePaginatedFetch('/bookings', params)
}

export function usePaginatedGroupedBookings(params: PaginatedParams) {
  return usePaginatedFetch('/bookings/grouped', params)
}

// ── Pets ────────────────────────────────────────────────
export function usePets(userId: string) {
  return useSWR(userId ? `/pets/user/${userId}` : null, fetcher)
}

export function usePet(id: string) {
  return useSWR(id ? `/pets/${id}` : null, fetcher)
}

// ── Reports ─────────────────────────────────────────────
export function useReports(sitterId?: string) {
  const endpoint = sitterId ? `/reports?sitterId=${sitterId}` : '/reports'
  return useSWR(endpoint, fetcher)
}

// ── Invoices ────────────────────────────────────────────
/**
 * Derived invoices (one per booking-group). Pass userId to scope to a client,
 * or omit for the admin-wide list.
 */
export function useInvoices(userId?: string, params?: PaginatedParams) {
  const base = userId ? `/invoices/user/${userId}` : '/invoices'
  const qs = toQueryString({ page: 1, limit: 10, ...(params ?? {}) })
  return useSWR<PaginatedResponse<any>>(`${base}?${qs}`, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })
}

export function useInvoiceDetail(id: string) {
  return useSWR(id ? `/invoices/derived/${id}` : null, fetcher)
}

// ── Availability ────────────────────────────────────────
export function useAvailabilitySlots(sitterId: string) {
  return useSWR(sitterId ? `/availability/slots/${sitterId}` : null, fetcher)
}

export function useAvailabilitySettings(sitterId: string) {
  return useSWR(sitterId ? `/availability/settings/${sitterId}` : null, fetcher)
}

// ── Notes / Communication ───────────────────────────────
export function useNotes(filterUserId?: string) {
  const url = filterUserId ? `/notes?recipientId=${filterUserId}` : '/notes'
  return useSWR(url, fetcher)
}

export function useRecentNotes(limit = 20) {
  return useSWR(`/notes/recent/${limit}`, fetcher)
}

export function useAvailableNoteUsers() {
  return useSWR('/notes/users/available', fetcher)
}

// ── Key Security ────────────────────────────────────────
export function useKeySecurity(clientId: string) {
  return useSWR(clientId ? `/key-security/client/${clientId}` : null, fetcher)
}

// ── All Pets (admin) ────────────────────────────────────
export function useAllPets() {
  return useSWR('/pets', fetcher)
}

// ── Single User by ID ───────────────────────────────────
export function useUserById(id?: string) {
  return useSWR(id ? `/users/${id}` : null, fetcher)
}

// ── Available sitters for booking (by date range) ───────
export function useAvailableSitters(startDate?: string, endDate?: string) {
  const url =
    startDate && endDate
      ? `/bookings/available-sitters?startDate=${startDate}&endDate=${endDate}`
      : null
  return useSWR(url, fetcher)
}
