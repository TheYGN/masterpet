import 'server-only'

export type UserRole =
  | 'owner'
  | 'branch_manager'
  | 'sales'
  | 'warehouse'
  | 'super_admin'

export type UserStatus = 'active' | 'inactive' | 'pending_invitation'

export type TenantStatus =
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'cancelled'

export type TrialStatus = 'active' | 'grace_period' | 'read_only' | 'expired'

export interface UserProfile {
  id: string
  auth_user_id: string
  tenant_id: string
  email: string
  full_name: string
  role: UserRole
  branch_id: string | null
  status: UserStatus
}

export interface TenantInfo {
  id: string
  name: string
  status: TenantStatus
  trial_status: TrialStatus | null
  trial_ends_at: string | null
}

export interface Session {
  authUserId: string
  email: string
  profile: UserProfile
  tenant: TenantInfo | null
}
