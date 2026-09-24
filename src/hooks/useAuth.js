import { useAuthContext } from '../contexts/AuthContext'

export default function useAuth(){
  const ctx = useAuthContext()
  return { user: ctx.user, isAuthenticated: !!ctx.user, login: ctx.login, logout: ctx.logout, refresh: ctx.refresh }
}
