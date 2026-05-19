import 'server-only'

import { requireRole } from './dal'
import type { Session, UserRole } from './definitions'

export function withAuth<TArgs extends unknown[], TResult>(
  allowed: UserRole[],
  fn: (session: Session, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const session = await requireRole(allowed)
    return fn(session, ...args)
  }
}
