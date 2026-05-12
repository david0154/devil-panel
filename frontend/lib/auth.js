export const getUser = () => {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem('dp_user')) } catch { return null }
}
export const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('dp_token') : null
export const logout = () => {
  localStorage.removeItem('dp_token')
  localStorage.removeItem('dp_user')
  window.location.href = '/login'
}
export const isAuthenticated = () => !!getToken()
