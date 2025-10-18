// lib/admin-auth.js - Admin role validation helper
// Note: Admin validation is primarily done on the frontend via PiNetworkContext
// The backend endpoints rely on the authenticated user's role from the session/database

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function isSeller(user) {
  return user?.role === 'seller' || user?.role === 'admin';
}

export function isReader(user) {
  return user?.role === 'reader';
}