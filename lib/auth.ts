// Authentication utilities
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const getUserFromToken = (): any | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Parse JWT token (basic implementation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const user = getUserFromToken();
    return user && user.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const getUserRole = (): string | null => {
  const user = getUserFromToken();
  return user?.role || null;
};
