/** Derive a friendly display name from OWeb session email / userId. */
export function displayNameFromSession(session: {
  email?: string | null;
  userId?: string | null;
} | null): string {
  const email = session?.email?.trim();
  if (email) {
    const local = email.split('@')[0] || email;
    // first.last → First Last; first_last → First Last; first → First
    const parts = local.split(/[._+\-]+/).filter(Boolean);
    if (parts.length > 0) {
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
  }
  if (session?.userId) {
    return `User ${session.userId.slice(0, 6)}`;
  }
  return 'You';
}
