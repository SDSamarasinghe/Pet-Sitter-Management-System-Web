// Authentication utilities — cookie-based token storage

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    document.cookie = `auth_token=${token}; path=/; SameSite=Strict; max-age=86400`
    // Keep localStorage for backward compatibility during migration
    localStorage.setItem('token', token)
  }
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null

  // Read from cookie first
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/)
  if (match) return match[1]

  // Fallback to localStorage for migration period
  const lsToken = localStorage.getItem('token')
  if (lsToken) {
    // Migrate to cookie
    setToken(lsToken)
    return lsToken
  }

  return null
}

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    document.cookie = 'auth_token=; path=/; max-age=0'
    localStorage.removeItem('token')
  }
}

export const getUserFromToken = (): {
  userId: string
  email: string
  role: string
  firstName: string
  lastName: string
  avatarUrl?: string
  exp: number
} | null => {
  const token = getToken()
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  const user = getUserFromToken()
  if (!user) return false
  return user.exp > Date.now() / 1000
}

export const getUserRole = (): string | null => {
  const user = getUserFromToken()
  return user?.role || null
}
