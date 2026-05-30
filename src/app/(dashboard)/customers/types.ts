// No 'server-only' — used by both client components and server actions

export type PreferredChannel = 'whatsapp' | 'phone' | 'email'
export type CustomerStatus = 'active' | 'inactive'

export const PREFERRED_CHANNELS: readonly PreferredChannel[] = ['whatsapp', 'phone', 'email'] as const
export const CUSTOMER_STATUSES: readonly CustomerStatus[] = ['active', 'inactive'] as const

export interface Customer {
  id: string
  tenant_id: string
  branch_id: string | null
  full_name: string
  phone: string
  phone_is_placeholder: boolean
  email: string | null
  address: string | null
  city: string | null
  preferred_channel: PreferredChannel
  notes: string | null
  status: CustomerStatus
  created_at: string
  updated_at: string
}

export interface CustomerListItem extends Customer {
  branch_name: string | null
}

export interface CreateCustomerInput {
  full_name: string
  phone: string
  email?: string
  address?: string
  city?: string
  preferred_channel: PreferredChannel
  notes?: string
  branch_id?: string
  status?: CustomerStatus
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>

export interface ListCustomersFilters {
  search?: string
  status?: CustomerStatus
  branch_id?: string
  city?: string
  limit?: number
  offset?: number
}

export interface CustomerKpis {
  active: number
  inactive: number
  newThisMonth: number
  whatsappPct: number
}

export interface CustomerImportRow {
  full_name: string
  phone: string
  email?: string | null
  address?: string | null
  city?: string | null
  preferred_channel?: string | null
  notes?: string | null
  branch_id?: string | null
  branch_name?: string | null
}

export type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string }
