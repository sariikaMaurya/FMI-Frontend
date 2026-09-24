import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

export default function RequireAuth({ children, role }){
  const { user, refresh } = useAuthContext();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        const token = await refresh();
        // token may be null
      }
      if (mounted) setChecking(false);
    })();
    return () => { mounted = false };
  }, [user, refresh]);

  if (checking) return <div>Checking authentication...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role ? `/dashboard/${user.role}` : '/'} replace />;
  }
  return children;
}
