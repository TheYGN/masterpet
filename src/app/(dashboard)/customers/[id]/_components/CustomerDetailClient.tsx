'use client'

import { useState } from 'react'
import type { CustomerListItem } from '../../types'
import type { OrderListItem } from '../../../orders/types'
import { CustomerCard } from './CustomerCard'
import { CustomerSheet } from '../../_components/CustomerSheet'

interface Props {
  customer: CustomerListItem
  branches: Array<{ id: string; name: string }>
  role: string
  orders: OrderListItem[]
  ordersTotal: number
}

export function CustomerDetailClient({ customer, branches, role, orders, ordersTotal }: Props) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <CustomerCard
        customer={customer}
        role={role}
        onEdit={() => setEditing(true)}
        orders={orders}
        ordersTotal={ordersTotal}
      />
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
