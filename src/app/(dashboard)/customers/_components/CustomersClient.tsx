'use client'

import { useState, useRef, useTransition } from 'react'
import type { CustomerKpis, CustomerListItem, CustomerStatus } from '../types'
import { listCustomersAction } from '../actions'
import { CustomerKpiStrip } from './CustomerKpiStrip'
import { CustomersTable } from './CustomersTable'
import { CustomerSheet } from './CustomerSheet'
import { ImportModal } from '../../products/_components/ImportModal'

interface Branch { id: string; name: string }

interface CustomersClientProps {
  initialCustomers: CustomerListItem[]
  initialTotal: number
  kpis: CustomerKpis
  pageSize: number
  branches: Branch[]
  role: string
}

export function CustomersClient({
  initialCustomers,
  initialTotal,
  kpis,
  pageSize,
  branches,
  role,
}: CustomersClientProps) {
  const [showNewSheet, setShowNewSheet] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerListItem | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all')

  const [customers, setCustomers] = useState<CustomerListItem[]>(initialCustomers)
  const [total, setTotal] = useState(initialTotal)
  const [loadedCount, setLoadedCount] = useState(initialCustomers.length)

  const [isSearching, startSearch] = useTransition()
  const [isLoadingMore, startLoadingMore] = useTransition()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestSearch = useRef({ search: '', status: 'all' as CustomerStatus | 'all' })

  const canWrite = role === 'owner' || role === 'branch_manager'
  const hasMore = loadedCount < total

  function fetchPage(newSearch: string, newStatus: CustomerStatus | 'all', offset: number, append: boolean) {
    startSearch(async () => {
      const res = await listCustomersAction({
        search: newSearch.trim() || undefined,
        status: newStatus !== 'all' ? newStatus : undefined,
        limit: pageSize,
        offset,
      })
      if (!res.data) return
      if (append) {
        setCustomers(prev => [...prev, ...res.data!.customers])
      } else {
        setCustomers(res.data.customers)
        setTotal(res.data.total)
      }
      setLoadedCount(offset + res.data.customers.length)
    })
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    latestSearch.current = { search: value, status: statusFilter }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchPage(value, statusFilter, 0, false)
    }, 300)
  }

  function handleStatusChange(value: CustomerStatus | 'all') {
    setStatusFilter(value)
    latestSearch.current = { search, status: value }
    fetchPage(search, value, 0, false)
  }

  function loadMore() {
    startLoadingMore(async () => {
      const res = await listCustomersAction({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: pageSize,
        offset: loadedCount,
      })
      if (!res.data) return
      setCustomers(prev => [...prev, ...res.data!.customers])
      setLoadedCount(prev => prev + res.data!.customers.length)
    })
  }

  return (
    <>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.3 }}>
            ניהול לקוחות
          </h1>
          <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
            כל הלקוחות, פרטי הקשר וההיסטוריה במקום אחד
          </div>
        </div>
        {canWrite && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowImport(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 40, padding: '0 16px', borderRadius: 999,
                background: 'transparent', color: 'var(--md-primary)',
                border: '1px solid var(--md-outline)',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              <span className="ms" style={{ fontSize: 18 }}>upload_file</span>
              ייבא מ-Excel
            </button>
            <button
              onClick={() => setShowNewSheet(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 40, padding: '0 16px', borderRadius: 999,
                background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: 'none',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <span className="ms" style={{ fontSize: 18 }}>person_add</span>
              הוסף לקוח
            </button>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <CustomerKpiStrip kpis={kpis} />

      {/* Toolbar */}
      <div style={{
        background: 'var(--md-surface-container-low)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 16, padding: '16px 24px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ position: 'relative', maxWidth: 420, flex: 1 }}>
            <span className="ms" style={{
              position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 20, color: isSearching ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
              pointerEvents: 'none', transition: 'color 150ms',
            }}>
              {isSearching ? 'autorenew' : 'search'}
            </span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="חיפוש לפי שם או טלפון..."
              style={{
                width: '100%', height: 40, paddingInlineStart: 40, paddingInlineEnd: 12,
                borderRadius: 999, border: '1px solid var(--md-outline-variant)',
                background: 'var(--md-surface-container)', fontSize: 13,
                color: 'var(--md-on-surface)', fontFamily: 'inherit', outline: 'none',
                direction: 'rtl', boxSizing: 'border-box',
                opacity: isSearching ? 0.7 : 1, transition: 'opacity 150ms',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {([['all', 'הכל'], ['active', 'פעיל'], ['inactive', 'לא פעיל']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => handleStatusChange(val as CustomerStatus | 'all')}
              style={{
                height: 32, padding: '0 14px', borderRadius: 999,
                background: statusFilter === val ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
                color: statusFilter === val ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                border: statusFilter === val ? 'none' : '1px solid var(--md-outline-variant)',
                fontFamily: 'inherit', fontSize: 13, fontWeight: statusFilter === val ? 600 : 400,
                cursor: 'pointer', transition: 'background 120ms',
              }}
            >
              {label}
            </button>
          ))}
          <span style={{ marginInlineStart: 'auto', fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
            מציג <strong>{loadedCount.toLocaleString()}</strong> מתוך <strong>{total.toLocaleString()}</strong> לקוחות
          </span>
        </div>
      </div>

      {/* Table */}
      <CustomersTable
        customers={customers}
        role={role}
        onEdit={setEditingCustomer}
        isLoading={isSearching}
      />

      {/* Load More */}
      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 44, padding: '0 28px', borderRadius: 999,
              background: 'transparent', color: 'var(--md-primary)',
              border: '1px solid var(--md-outline)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
              cursor: isLoadingMore ? 'wait' : 'pointer',
              opacity: isLoadingMore ? 0.6 : 1,
              transition: 'opacity 150ms',
            }}
          >
            <span className="ms" style={{
              fontSize: 18,
              animation: isLoadingMore ? 'spin 1s linear infinite' : undefined,
            }}>
              {isLoadingMore ? 'autorenew' : 'expand_more'}
            </span>
            {isLoadingMore
              ? 'טוען...'
              : `טען עוד ${Math.min(pageSize, total - loadedCount)} לקוחות`}
          </button>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        target="customers"
      />

      {/* Sheets */}
      {showNewSheet && (
        <CustomerSheet branches={branches} onClose={() => setShowNewSheet(false)} />
      )}
      {editingCustomer && (
        <CustomerSheet
          mode="edit"
          initialCustomer={editingCustomer}
          branches={branches}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </>
  )
}
