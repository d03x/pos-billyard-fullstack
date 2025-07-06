export interface User {
  id: number
  email: string
  name?: string
}

export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}

export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

