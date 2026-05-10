import useSWR from 'swr'
import api from '@/lib/api'

const fetcher = (url: string) => api.get(url).then((r) => r.data)

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
  const endpoint =
    role === 'admin'
      ? '/bookings'
      : role === 'sitter'
        ? `/bookings/sitter/${userId}`
        : `/bookings/user/${userId}`
  return useSWR(endpoint, fetcher)
}

export function useBooking(id: string) {
  return useSWR(id ? `/bookings/${id}` : null, fetcher)
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
export function useInvoices(userId?: string) {
  const endpoint = userId ? `/invoices/user/${userId}` : '/invoices'
  return useSWR(endpoint, fetcher)
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
