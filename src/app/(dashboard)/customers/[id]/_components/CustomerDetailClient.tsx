'use client'

import { useState } from 'react'
import type { CustomerListItem } from '../../types'
import { CustomerCard } from './CustomerCard'
import { CustomerSheet } from '../../_components/CustomerSheet'

interface Props {
  customer: CustomerListItem
  branches: Array<{ id: string; name: string }>
  role: string
}

export function CustomerDetailClient({ customer, branches, role }: Props) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <CustomerCard customer={customer} role={role} onEdit={() => setEditing(true)} />
      {editing && (
        <CustomerSheet
          mode="edit"
          initialCustomer={customer}
          branches={branches}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
