'use client'

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  PRODUCT_IMPORT_FIELDS,
  CUSTOMER_IMPORT_FIELDS,
  validateImportRow,
  validateCustomerImportRow,
  generateAutoSku,
  parseImportDate,
  type ImportTarget,
  type ImportFieldDef,
  type ColumnMappingRecord,
  type ConflictStrategy,
  type IntraFileDuplicateGroup,
  type ParsedRow,
  type ValidatedImportRow,
  type ImportMappingTemplate,
  type ImportResult,
} from '../import-types'
import {
  importProductsAction,
  saveImportMappingAction,
  getImportMappingsAction,
} from '../actions'
import { importCustomersAction } from '../../customers/actions'

type ImportStep = 'upload' | 'preview' | 'mapping' | 'validation' | 'done'

const SECTION_LABELS: Record<string, string> = {
  product: 'מוצר',
  variant: 'Variant / SKU',
  inventory: 'מלאי',
  dimension: 'מימד (גודל/טעם)',
  customer: 'לקוח',
}

function detectIntraFileDuplicates(
  rows: ParsedRow[],
  mapping: ColumnMappingRecord,
  keyFieldId: string
): IntraFileDuplicateGroup[] {
  const keyCol = Object.keys(mapping).find((col) => mapping[col] === keyFieldId)
  if (!keyCol) return []
  const keyMap = new Map<string, number[]>()
  rows.forEach((row, i) => {
    const val = (row[keyCol] ?? '').trim()
    if (!val) return
    if (!keyMap.has(val)) keyMap.set(val, [])
    keyMap.get(val)!.push(i)
  })
  return Array.from(keyMap.entries())
    .filter(([, indexes]) => indexes.length > 1)
    .map(([sku, rowIndexes]) => ({ sku, rowIndexes, chosenIndex: rowIndexes[0] }))
}

interface ImportModalProps {
  open: boolean
  onClose: () => void
  target?: ImportTarget
}

export function ImportModal({ open, onClose, target = 'products' }: ImportModalProps) {
  const router = useRouter()

  const importFields = target === 'products' ? PRODUCT_IMPORT_FIELDS : CUSTOMER_IMPORT_FIELDS
  const duplicateKeyField = target === 'products' ? 'variant.sku' : 'customer.phone'
  const entityLabel = target === 'products' ? 'מוצרים' : 'לקוחות'
  const sections = target === 'products'
    ? ['product', 'variant', 'inventory', 'dimension']
    : ['customer']
  const requiredFields = target === 'products'
    ? ['product.name', 'variant.sku', 'variant.price']
    : ['customer.phone']

  const [step, setStep] = useState<ImportStep>('upload')
  const [fileName, setFileName] = useState('')
  const [totalRows, setTotalRows] = useState(0)
  const [headers, setHeaders] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [mapping, setMapping] = useState<ColumnMappingRecord>({})
  const [validatedRows, setValidatedRows] = useState<ValidatedImportRow[]>([])
  const [savedTemplates, setSavedTemplates] = useState<ImportMappingTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [autoGenSku, setAutoGenSku] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isImporting, startImport] = useTransition()
  const [parseError, setParseError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [duplicateGroups, setDuplicateGroups] = useState<IntraFileDuplicateGroup[]>([])
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>('skip')
  const [placeholderPhone, setPlaceholderPhone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    getImportMappingsAction(target).then((res) => {
      if (res.data) setSavedTemplates(res.data)
    })
  }, [open, target])

  const resetState = useCallback(() => {
    setStep('upload')
    setFileName('')
    setTotalRows(0)
    setHeaders([])
    setParsedRows([])
    setMapping({})
    setValidatedRows([])
    setAutoGenSku(false)
    setSelectedTemplate('')
    setTemplateName('')
    setShowSaveTemplate(false)
    setResult(null)
    setParseError(null)
    setImportError(null)
    setDuplicateGroups([])
    setShowDuplicateDialog(false)
    setConflictStrategy('skip')
    setPlaceholderPhone(false)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  const parseFile = useCallback(async (file: File) => {
    setParseError(null)
    setFileName(file.name)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

    if (!['csv', 'xls', 'xlsx', 'xlc', 'xlm', 'xlsb'].includes(ext)) {
      setParseError('קובץ לא נתמך. יש להעלות CSV, XLS או XLSX')
      return
    }

    try {
      if (ext === 'csv') {
        Papa.parse<ParsedRow>(file, {
          header: true,
          skipEmptyLines: true,
          complete: (res) => {
            if (!res.data.length) { setParseError('הקובץ ריק'); return }
            const overflow = res.data.length > 5000
            const rows = res.data.slice(0, 5000)
            setTotalRows(res.data.length)
            setHeaders(res.meta.fields ?? [])
            setParsedRows(rows)
            if (overflow) setParseError('הקובץ מכיל יותר מ-5,000 שורות — נטענות 5,000 ראשונות בלבד')
            setStep('preview')
          },
          error: (err: { message: string }) => setParseError(`שגיאת CSV: ${err.message}`),
        })
      } else {
        const buffer = await file.arrayBuffer()
        const wb = XLSX.read(buffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
        if (!raw.length) { setParseError('הגיליון הראשון ריק'); return }
        const overflow = raw.length > 5000
        const rows: ParsedRow[] = raw.slice(0, 5000).map((r) => {
          const out: ParsedRow = {}
          for (const [k, v] of Object.entries(r)) out[String(k)] = String(v ?? '')
          return out
        })
        setTotalRows(raw.length)
        setHeaders(Object.keys(rows[0]))
        setParsedRows(rows)
        if (overflow) setParseError('הקובץ מכיל יותר מ-5,000 שורות — נטענות 5,000 ראשונות בלבד')
        setStep('preview')
      }
    } catch (e) {
      setParseError(`שגיאה בפתיחת הקובץ: ${e instanceof Error ? e.message : 'שגיאה לא ידועה'}`)
    }
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) parseFile(file)
    },
    [parseFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) parseFile(file)
    },
    [parseFile]
  )

  const applyTemplate = useCallback(
    (templateId: string) => {
      const tpl = savedTemplates.find((t) => t.id === templateId)
      if (!tpl) return
      setMapping(tpl.mapping)
      setSelectedTemplate(templateId)
    },
    [savedTemplates]
  )

  const proceedToValidation = useCallback((rows: ParsedRow[], originalIndexes?: number[]) => {
    const validateFn = target === 'products' ? validateImportRow : validateCustomerImportRow
    const results = rows.map((row, i) =>
      validateFn(row, mapping, originalIndexes ? originalIndexes[i] : i)
    )
    setValidatedRows(results)
    setStep('validation')
  }, [mapping, target])

  const runValidation = useCallback(() => {
    const groups = detectIntraFileDuplicates(parsedRows, mapping, duplicateKeyField)
    if (groups.length > 0) {
      setDuplicateGroups(groups)
      setShowDuplicateDialog(true)
      return
    }
    proceedToValidation(parsedRows)
  }, [parsedRows, mapping, duplicateKeyField, proceedToValidation])

  const resolveDuplicates = useCallback(() => {
    const skipIndexes = new Set<number>()
    for (const group of duplicateGroups) {
      for (const idx of group.rowIndexes) {
        if (idx !== group.chosenIndex) skipIndexes.add(idx)
      }
    }
    const filtered: ParsedRow[] = []
    const originalIndexes: number[] = []
    parsedRows.forEach((row, i) => {
      if (!skipIndexes.has(i)) {
        filtered.push(row)
        originalIndexes.push(i)
      }
    })
    setShowDuplicateDialog(false)
    proceedToValidation(filtered, originalIndexes)
  }, [duplicateGroups, parsedRows, proceedToValidation])

  const handleSaveTemplate = useCallback(async () => {
    if (!templateName.trim()) return
    setSavingTemplate(true)
    const res = await saveImportMappingAction({
      name: templateName.trim(),
      target,
      mapping,
    })
    setSavingTemplate(false)
    if (res.data) {
      setShowSaveTemplate(false)
      setTemplateName('')
      const updated = await getImportMappingsAction(target)
      if (updated.data) setSavedTemplates(updated.data)
    }
  }, [templateName, mapping, target])

  const handleImport = useCallback(() => {
    setImportError(null)

    if (target === 'products') {
      const importTimestamp = Date.now()
      const validRows = validatedRows.filter(
        (r) => r.errors.length === 0 && r.data && (!r.missingSkuType || autoGenSku)
      )
      if (!validRows.length) { setImportError('אין שורות תקינות לייבוא'); return }

      const rowsData = validRows.map((r) => ({
        ...r.data!,
        variant: {
          ...r.data!.variant,
          sku: r.missingSkuType
            ? generateAutoSku(importTimestamp, r.rowIndex)
            : r.data!.variant.sku,
        },
      }))

      startImport(async () => {
        const res = await importProductsAction(rowsData, conflictStrategy)
        if (res.error) { setImportError(res.error); return }
        setResult(res.data!)
        router.refresh()
        setStep('done')
      })
    } else {
      const validRows = validatedRows.filter((r) => r.errors.length === 0 && (!r.missingPhone || placeholderPhone))
      if (!validRows.length) { setImportError('אין שורות תקינות לייבוא'); return }

      const getRaw = (raw: ParsedRow, fieldId: string) => {
        const col = Object.keys(mapping).find((c) => mapping[c] === fieldId)
        return col ? (raw[col] ?? '').trim() : ''
      }

      const customerRows = validRows.map((r) => {
        const fullNameDirect = getRaw(r.raw, 'customer.full_name')
        const firstName = getRaw(r.raw, 'customer.first_name')
        const lastName = getRaw(r.raw, 'customer.last_name')
        const full_name = fullNameDirect || [firstName, lastName].filter(Boolean).join(' ')

        // Build address: prefer direct mapping; otherwise concatenate sub-fields
        let address = getRaw(r.raw, 'customer.address') || null
        if (!address) {
          const street = getRaw(r.raw, 'customer.street')
          const houseNum = getRaw(r.raw, 'customer.house_number')
          const apt = getRaw(r.raw, 'customer.apartment')
          const floor = getRaw(r.raw, 'customer.floor')
          const entrance = getRaw(r.raw, 'customer.entrance')
          const streetHouse = [street, houseNum].filter(Boolean).join(' ')
          const parts = [
            streetHouse || null,
            apt ? `דירה ${apt}` : null,
            floor ? `קומה ${floor}` : null,
            entrance ? `כניסה ${entrance}` : null,
          ].filter(Boolean)
          address = parts.length ? parts.join(', ') : null
        }

        // Extra fields go to notes (phone2, joined_at — no dedicated DB column yet)
        const baseNotes = getRaw(r.raw, 'customer.notes') || null
        const phone2 = getRaw(r.raw, 'customer.phone2') || null
        const joinedRaw = getRaw(r.raw, 'customer.joined_at') || null
        const joinedParsed = joinedRaw ? parseImportDate(joinedRaw) : null
        const extraParts: string[] = []
        if (phone2) extraParts.push(`טלפון נייד 2: ${phone2}`)
        if (joinedParsed) extraParts.push(`תאריך הצטרפות: ${joinedParsed}`)
        const notes = [baseNotes, ...extraParts].filter(Boolean).join('\n') || null

        return {
          full_name,
          phone: getRaw(r.raw, 'customer.phone'),
          email: getRaw(r.raw, 'customer.email') || null,
          address,
          city: getRaw(r.raw, 'customer.city') || null,
          preferred_channel: getRaw(r.raw, 'customer.preferred_channel') || null,
          notes,
          branch_name: getRaw(r.raw, 'customer.branch_name') || null,
        }
      })

      startImport(async () => {
        const res = await importCustomersAction(customerRows, conflictStrategy as 'skip' | 'merge', placeholderPhone)
        if (res.error) { setImportError(res.error); return }
        const d = res.data!
        setResult({
          imported: d.imported,
          failed: d.failed,
          errors: d.errors.map((e) => ({ rowIndex: e.rowIndex, sku: e.phone, reason: e.reason })),
        })
        router.refresh()
        setStep('done')
      })
    }
  }, [validatedRows, autoGenSku, conflictStrategy, router, target, mapping])

  if (!open) return null

  const skuMissingCount = validatedRows.filter((r) => r.missingSkuType && r.errors.length === 0).length
  const phoneMissingCount = validatedRows.filter((r) => r.missingPhone && !r.missingName && r.errors.length === 0).length
  const nameMissingCount = validatedRows.filter((r) => r.missingName && r.errors.length === 0).length
  const validCount = validatedRows.filter((r) => r.errors.length === 0 && !r.missingSkuType && !r.missingPhone && !r.missingName).length
  const errorCount = validatedRows.filter((r) => r.errors.length > 0).length
  const importableCount = validCount + (autoGenSku ? skuMissingCount : 0) + nameMissingCount + (placeholderPhone ? phoneMissingCount : 0)
  const mappingValues = Object.values(mapping)
  const canProceedMapping = target === 'products'
    ? requiredFields.every((f) => mappingValues.includes(f))
    : mappingValues.includes('customer.full_name') ||
      mappingValues.includes('customer.first_name') ||
      mappingValues.includes('customer.last_name')

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
          style={{
            width: '100%', maxWidth: 900,
            maxHeight: '90vh',
            background: 'var(--md-surface-container-lowest)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-3)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--md-outline-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="ms" style={{ fontSize: 22, color: 'var(--md-primary)' }}>upload_file</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)' }}>
                  ייבוא {entityLabel} מ-Excel / CSV
                </div>
                {fileName && (
                  <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
                    {fileName} · {totalRows.toLocaleString()} שורות
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: 'transparent', cursor: 'pointer', color: 'var(--md-on-surface-variant)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="ms" style={{ fontSize: 22 }}>close</span>
            </button>
          </div>

          {/* Stepper */}
          <Stepper step={step} />

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {step === 'upload' && (
              <UploadStep
                isDragging={isDragging}
                parseError={parseError}
                fileInputRef={fileInputRef}
                onFileInput={handleFileInput}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
              />
            )}

            {step === 'preview' && (
              <PreviewStep headers={headers} rows={parsedRows.slice(0, 10)} totalRows={totalRows} />
            )}

            {step === 'mapping' && (
              <MappingStep
                headers={headers}
                sampleRows={parsedRows.slice(0, 3)}
                mapping={mapping}
                importFields={importFields}
                sections={sections}
                requiredFields={requiredFields}
                savedTemplates={savedTemplates}
                selectedTemplate={selectedTemplate}
                showSaveTemplate={showSaveTemplate}
                templateName={templateName}
                savingTemplate={savingTemplate}
                showWooHint={target === 'products'}
                hint={target === 'customers' ? 'שם פרטי + שם משפחה יאוחדו לשם מלא. שדות רחוב / מספר בית / דירה / קומה / כניסה יאוחדו אוטומטית לשדה "כתובת"' : null}
                onMappingChange={(col, fieldId) => setMapping((m) => ({ ...m, [col]: fieldId }))}
                onApplyTemplate={applyTemplate}
                onToggleSaveTemplate={() => setShowSaveTemplate((v) => !v)}
                onTemplateNameChange={setTemplateName}
                onSaveTemplate={handleSaveTemplate}
              />
            )}

            {step === 'validation' && (
              <ValidationStep
                validatedRows={validatedRows}
                headers={headers}
                mapping={mapping}
                validCount={validCount}
                errorCount={errorCount}
                skuMissingCount={skuMissingCount}
                phoneMissingCount={phoneMissingCount}
                nameMissingCount={nameMissingCount}
                autoGenSku={autoGenSku}
                onSetAutoGenSku={setAutoGenSku}
                conflictStrategy={conflictStrategy}
                onConflictStrategyChange={setConflictStrategy}
                placeholderPhone={placeholderPhone}
                onPlaceholderPhoneChange={setPlaceholderPhone}
                showSkuSection={target === 'products'}
                conflictKeyLabel={target === 'products' ? 'SKU' : 'טלפון'}
              />
            )}

            {step === 'done' && result && (
              <DoneStep
                result={result}
                entityLabel={entityLabel}
                keyLabel={target === 'products' ? 'SKU' : 'טלפון'}
              />
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--md-outline-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, gap: 12,
          }}>
            <div style={{ fontSize: 13, color: 'var(--md-error)' }}>
              {importError}
            </div>
            <div style={{ display: 'flex', gap: 10, marginInlineStart: 'auto' }}>
              {step !== 'upload' && step !== 'done' && (
                <button onClick={() => {
                  if (step === 'preview') setStep('upload')
                  else if (step === 'mapping') setStep('preview')
                  else if (step === 'validation') setStep('mapping')
                }} style={outlineBtn}>
                  חזרה
                </button>
              )}

              {step === 'upload' && (
                <button onClick={() => fileInputRef.current?.click()} style={primaryBtn}>
                  <span className="ms" style={{ fontSize: 18 }}>folder_open</span>
                  בחר קובץ
                </button>
              )}

              {step === 'preview' && (
                <button onClick={() => setStep('mapping')} style={primaryBtn}>
                  המשך למיפוי
                  <span className="ms" style={{ fontSize: 18, transform: 'scaleX(-1)', display: 'inline-block' }}>arrow_forward</span>
                </button>
              )}

              {step === 'mapping' && (
                <button
                  onClick={runValidation}
                  disabled={!canProceedMapping}
                  style={canProceedMapping ? primaryBtn : disabledBtn}
                >
                  אמת שורות
                  <span className="ms" style={{ fontSize: 18 }}>check_circle</span>
                </button>
              )}

              {step === 'validation' && (
                <button
                  onClick={handleImport}
                  disabled={isImporting || importableCount === 0}
                  style={importableCount > 0 && !isImporting ? primaryBtn : disabledBtn}
                >
                  {isImporting ? (
                    <><span className="ms" style={{ fontSize: 18 }}>hourglass_top</span> מייבא…</>
                  ) : (
                    <><span className="ms" style={{ fontSize: 18 }}>upload</span> ייבא {importableCount} {entityLabel}</>
                  )}
                </button>
              )}

              {step === 'done' && (
                <button onClick={handleClose} style={primaryBtn}>
                  סגור
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Resolution Dialog — renders above modal (z-index 80) */}
      {showDuplicateDialog && (
        <DuplicateDialog
          groups={duplicateGroups}
          parsedRows={parsedRows}
          headers={headers}
          mapping={mapping}
          keyLabel={target === 'products' ? 'SKU' : 'טלפון'}
          onChoose={(sku, idx) =>
            setDuplicateGroups((prev) =>
              prev.map((g) => (g.sku === sku ? { ...g, chosenIndex: idx } : g))
            )
          }
          onQuickAll={(strategy) =>
            setDuplicateGroups((prev) =>
              prev.map((g) => ({
                ...g,
                chosenIndex:
                  strategy === 'first'
                    ? g.rowIndexes[0]
                    : g.rowIndexes[g.rowIndexes.length - 1],
              }))
            )
          }
          onConfirm={resolveDuplicates}
        />
      )}
    </>
  )
}

// ── Stepper ──────────────────────────────────────────────────────────────────

const STEPS: Array<{ key: ImportStep; label: string; icon: string }> = [
  { key: 'upload',     label: 'העלאה',  icon: 'upload_file' },
  { key: 'preview',    label: 'תצוגה',  icon: 'table_view' },
  { key: 'mapping',    label: 'מיפוי',  icon: 'tune' },
  { key: 'validation', label: 'אימות',  icon: 'fact_check' },
  { key: 'done',       label: 'סיום',   icon: 'check_circle' },
]
const STEP_ORDER = STEPS.map((s) => s.key)

function Stepper({ step }: { step: ImportStep }) {
  const current = STEP_ORDER.indexOf(step)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '12px 24px',
      background: 'var(--md-surface-container-low)',
      borderBottom: '1px solid var(--md-outline-variant)',
      flexShrink: 0, gap: 0,
    }}>
      {STEPS.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done || active ? 'var(--md-primary)' : 'var(--md-outline-variant)',
                color: done || active ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, flexShrink: 0,
              }}>
                {done
                  ? <span className="ms" style={{ fontSize: 16 }}>check</span>
                  : <span className="ms" style={{ fontSize: 16 }}>{s.icon}</span>}
              </div>
              <span style={{
                fontSize: 12, fontWeight: active ? 600 : 400,
                color: active ? 'var(--md-primary)' : done ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1, margin: '0 8px',
                background: done ? 'var(--md-primary)' : 'var(--md-outline-variant)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Upload Step ───────────────────────────────────────────────────────────────

function UploadStep({
  isDragging, parseError, fileInputRef, onFileInput, onDrop, onDragOver, onDragLeave
}: {
  isDragging: boolean
  parseError: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%', padding: '48px 24px',
          border: `2px dashed ${isDragging ? 'var(--md-primary)' : 'var(--md-outline-variant)'}`,
          borderRadius: 16,
          background: isDragging ? 'var(--md-primary-container)' : 'var(--md-surface-container-low)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          cursor: 'pointer', transition: 'all 0.15s ease',
          textAlign: 'center',
        }}
      >
        <span className="ms" style={{ fontSize: 56, color: isDragging ? 'var(--md-primary)' : 'var(--md-outline)', fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
          upload_file
        </span>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--md-on-surface)' }}>
          גרור קובץ לכאן, או לחץ לבחירה
        </div>
        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
          CSV, XLS, XLSX — עד 5,000 שורות
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx,.xlc,.xlm,.xlsb"
        onChange={onFileInput}
        style={{ display: 'none' }}
      />

      {parseError && (
        <div style={{
          width: '100%', padding: '12px 16px', borderRadius: 10,
          background: 'var(--md-error-container)', color: 'var(--md-on-error-container)',
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span className="ms" style={{ fontSize: 18 }}>error</span>
          {parseError}
        </div>
      )}

      <div style={{
        width: '100%', padding: '14px 18px', borderRadius: 12,
        background: 'var(--md-surface-container)', fontSize: 13, color: 'var(--md-on-surface-variant)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--md-on-surface)' }}>טיפ לייצוא מ-Excel:</div>
        ב-Excel ← שמור בשם ← CSV UTF-8 (מופרד בפסיק) — לתוצאות הטובות ביותר בעברית.
        קבצי XLSX עובדים מעולה ישירות.
      </div>
    </div>
  )
}

// ── Preview Step ──────────────────────────────────────────────────────────────

function PreviewStep({ headers, rows, totalRows }: { headers: string[]; rows: ParsedRow[]; totalRows: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>
        מציג 10 שורות ראשונות מתוך <strong style={{ color: 'var(--md-on-surface)' }}>{totalRows.toLocaleString()}</strong> בקובץ.
        בשלב הבא תמפה כל עמודה לשדה מ-MasterPet.
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--md-outline-variant)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--md-surface-container)' }}>
              {headers.map((h) => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'right',
                  color: 'var(--md-on-surface)', fontWeight: 600,
                  borderBottom: '1px solid var(--md-outline-variant)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--md-outline-variant)' : 'none' }}>
                {headers.map((h) => (
                  <td key={h} style={{ padding: '8px 14px', color: 'var(--md-on-surface-variant)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row[h] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Mapping Step ──────────────────────────────────────────────────────────────

function MappingStep({
  headers, sampleRows, mapping, importFields, sections, requiredFields,
  savedTemplates, selectedTemplate, showSaveTemplate, templateName, savingTemplate, showWooHint, hint,
  onMappingChange, onApplyTemplate, onToggleSaveTemplate, onTemplateNameChange, onSaveTemplate,
}: {
  headers: string[]
  sampleRows: ParsedRow[]
  mapping: ColumnMappingRecord
  importFields: ImportFieldDef[]
  sections: string[]
  requiredFields: string[]
  savedTemplates: ImportMappingTemplate[]
  selectedTemplate: string
  showSaveTemplate: boolean
  templateName: string
  savingTemplate: boolean
  showWooHint: boolean
  hint: string | null
  onMappingChange: (col: string, fieldId: string) => void
  onApplyTemplate: (id: string) => void
  onToggleSaveTemplate: () => void
  onTemplateNameChange: (v: string) => void
  onSaveTemplate: () => void
}) {
  const missingRequired = requiredFields.filter((f) => !Object.values(mapping).includes(f))
  const allRequired = missingRequired.length === 0
  const requiredLabels = requiredFields.map((f) => importFields.find((fd) => fd.id === f)?.label ?? f)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Template loader */}
      {savedTemplates.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="ms" style={{ fontSize: 18, color: 'var(--md-primary)' }}>bookmark</span>
          <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>טעינת מיפוי שמור:</span>
          <select
            value={selectedTemplate}
            onChange={(e) => onApplyTemplate(e.target.value)}
            style={{ ...selectStyle, flex: 1, maxWidth: 260 }}
          >
            <option value="">בחר תבנית…</option>
            {savedTemplates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Required fields notice */}
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: !allRequired ? 'var(--md-warning-container)' : 'var(--md-surface-container)',
        color: !allRequired ? 'var(--md-on-warning-container)' : 'var(--md-on-surface-variant)',
        fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span className="ms" style={{ fontSize: 18 }}>{!allRequired ? 'warning' : 'info'}</span>
        שדות חובה:{' '}
        {requiredLabels.map((l, i) => (
          <span key={l}>
            {i > 0 && ', '}
            <strong>{l}</strong>
          </span>
        ))}
        {allRequired && <span> ✓ כולם ממופים</span>}
      </div>

      {/* Target-specific hint */}
      {hint && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'var(--md-primary-container)',
          fontSize: 12, color: 'var(--md-on-primary-container)',
          display: 'flex', gap: 8,
        }}>
          <span className="ms" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>tips_and_updates</span>
          <span>{hint}</span>
        </div>
      )}

      {/* WooCommerce hint — products only */}
      {showWooHint && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'var(--md-surface-container)',
          fontSize: 12, color: 'var(--md-on-surface-variant)',
          display: 'flex', gap: 8,
        }}>
          <span className="ms" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>info</span>
          <span>
            <strong style={{ color: 'var(--md-on-surface)' }}>WooCommerce:</strong>{' '}
            עמודת <strong>קטגוריות</strong> ← מפה לשדה <strong>קטגוריות</strong>.{' '}
            עמודת <strong>פילטרים</strong> ← אין מקבילה ישירה; ניתן לדלג.{' '}
            עמודת <strong>מוצג למכירה</strong> ← מפה ל<strong>סטטוס</strong> (כן=active, לא=inactive).
          </span>
        </div>
      )}

      {/* Mapping table */}
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--md-outline-variant)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--md-surface-container-low)' }}>
              {headers.map((h) => (
                <th key={h} style={{
                  padding: '10px 12px', textAlign: 'right',
                  borderBottom: '1px solid var(--md-outline-variant)',
                  minWidth: 160,
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--md-on-surface)', marginBottom: 6 }}>{h}</div>
                  <select
                    value={mapping[h] ?? ''}
                    onChange={(e) => onMappingChange(h, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">לא לייבא</option>
                    {sections.map((section) => (
                      <optgroup key={section} label={SECTION_LABELS[section]}>
                        {importFields.filter((f) => f.section === section).map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}{f.required ? ' *' : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((row, i) => (
              <tr key={i} style={{ borderBottom: i < sampleRows.length - 1 ? '1px solid var(--md-outline-variant)' : 'none' }}>
                {headers.map((h) => (
                  <td key={h} style={{ padding: '8px 12px', color: 'var(--md-on-surface-variant)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row[h] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save template */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onToggleSaveTemplate} style={outlineBtn}>
          <span className="ms" style={{ fontSize: 16 }}>bookmark_add</span>
          שמור מיפוי לשימוש חוזר
        </button>
        {showSaveTemplate && (
          <>
            <input
              type="text"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              placeholder='שם התבנית, למשל "WooCommerce Export"'
              style={{ ...selectStyle, minWidth: 240 }}
              onKeyDown={(e) => e.key === 'Enter' && onSaveTemplate()}
            />
            <button
              onClick={onSaveTemplate}
              disabled={savingTemplate || !templateName.trim()}
              style={savingTemplate || !templateName.trim() ? disabledBtn : primaryBtn}
            >
              {savingTemplate ? 'שומר…' : 'שמור'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Validation Step ───────────────────────────────────────────────────────────

function ValidationStep({
  validatedRows, headers, mapping, validCount, errorCount,
  skuMissingCount, phoneMissingCount, nameMissingCount, autoGenSku, onSetAutoGenSku,
  conflictStrategy, onConflictStrategyChange,
  placeholderPhone, onPlaceholderPhoneChange,
  showSkuSection, conflictKeyLabel,
}: {
  validatedRows: ValidatedImportRow[]
  headers: string[]
  mapping: ColumnMappingRecord
  validCount: number
  errorCount: number
  skuMissingCount: number
  phoneMissingCount: number
  nameMissingCount: number
  autoGenSku: boolean
  onSetAutoGenSku: (v: boolean) => void
  conflictStrategy: ConflictStrategy
  onConflictStrategyChange: (v: ConflictStrategy) => void
  placeholderPhone: boolean
  onPlaceholderPhoneChange: (v: boolean) => void
  showSkuSection: boolean
  conflictKeyLabel: string
}) {
  const mappedHeaders = headers.filter((h) => mapping[h])
  const conflictOptions: ConflictStrategy[] = showSkuSection
    ? ['skip', 'merge', 'replace']
    : ['skip', 'merge']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          flex: 1, padding: '12px 16px', borderRadius: 10,
          background: 'var(--md-surface-container)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span className="ms" style={{ fontSize: 22, color: 'var(--md-primary)' }}>check_circle</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface)' }}>{validCount.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>שורות תקינות</div>
          </div>
        </div>
        {showSkuSection && skuMissingCount > 0 && (
          <div style={{
            flex: 1, padding: '12px 16px', borderRadius: 10,
            background: autoGenSku ? 'var(--md-primary-container)' : 'var(--md-surface-container-high, #ece6f0)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span className="ms" style={{ fontSize: 22, color: autoGenSku ? 'var(--md-primary)' : 'var(--md-on-surface-variant)' }}>
              {autoGenSku ? 'auto_fix_high' : 'label_off'}
            </span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface)' }}>{skuMissingCount.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                {autoGenSku ? 'יקבלו SKU אוטומטי' : 'ללא SKU'}
              </div>
            </div>
          </div>
        )}
        {!showSkuSection && phoneMissingCount > 0 && (
          <div style={{
            flex: 1, padding: '12px 16px', borderRadius: 10,
            background: placeholderPhone ? 'var(--md-primary-container)' : 'var(--md-error-container)',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'background 0.2s',
          }}>
            <span className="ms" style={{ fontSize: 22, color: placeholderPhone ? 'var(--md-primary)' : 'var(--md-error)' }}>
              {placeholderPhone ? 'phone_in_talk' : 'phone_disabled'}
            </span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: placeholderPhone ? 'var(--md-on-primary-container)' : 'var(--md-on-error-container)' }}>{phoneMissingCount.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: placeholderPhone ? 'var(--md-on-primary-container)' : 'var(--md-on-error-container)', opacity: 0.8 }}>
                {placeholderPhone ? 'ללא טלפון (מספר פיקטיבי)' : 'ללא טלפון (ידולגו)'}
              </div>
            </div>
          </div>
        )}
        {!showSkuSection && nameMissingCount > 0 && (
          <div style={{
            flex: 1, padding: '12px 16px', borderRadius: 10,
            background: '#fdf4ff',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span className="ms" style={{ fontSize: 22, color: '#9333ea' }}>person_off</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface)' }}>{nameMissingCount.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#6b21a8' }}>ללא שם (יובאו)</div>
            </div>
          </div>
        )}
        {errorCount > 0 && (
          <div style={{
            flex: 1, padding: '12px 16px', borderRadius: 10,
            background: 'var(--md-error-container)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span className="ms" style={{ fontSize: 22, color: 'var(--md-error)' }}>error</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-error-container)' }}>{errorCount.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--md-on-error-container)', opacity: 0.8 }}>שורות עם שגיאות (ידולגו)</div>
            </div>
          </div>
        )}
      </div>

      {/* Missing phone / name banners — customers only */}
      {!showSkuSection && phoneMissingCount > 0 && (
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: placeholderPhone ? 'var(--md-primary-container)' : 'var(--md-error-container)',
          border: `1px solid ${placeholderPhone ? 'var(--md-primary)' : 'var(--md-error)'}`,
          display: 'flex', alignItems: 'flex-start', gap: 12,
          transition: 'background 0.2s, border-color 0.2s',
        }}>
          <span className="ms" style={{ fontSize: 22, color: placeholderPhone ? 'var(--md-primary)' : 'var(--md-error)', flexShrink: 0, marginTop: 1 }}>
            {placeholderPhone ? 'phone_in_talk' : 'phone_disabled'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: placeholderPhone ? 'var(--md-on-primary-container)' : 'var(--md-on-error-container)', lineHeight: 1.5 }}>
              <strong>{phoneMissingCount} לקוחות</strong> ללא טלפון.{' '}
              {placeholderPhone
                ? <>יקבלו מספר פיקטיבי בפורמט <code style={{ fontSize: 12, background: 'rgba(0,0,0,0.08)', padding: '1px 6px', borderRadius: 4 }}>000-XXXXXXX</code> ויסומנו בתגית <strong>ללא טלפון מקורי</strong>.</>
                : <>ידולגו — טלפון הוא שדה חובה.</>}
            </div>
            {!placeholderPhone && (
              <button
                onClick={() => onPlaceholderPhoneChange(true)}
                style={{ ...primaryBtn, height: 32, fontSize: 12, padding: '0 14px', marginTop: 10 }}
              >
                <span className="ms" style={{ fontSize: 16 }}>auto_fix_high</span>
                ייצר מספר פיקטיבי וייבא אותם
              </button>
            )}
            {placeholderPhone && (
              <button
                onClick={() => onPlaceholderPhoneChange(false)}
                style={{ ...outlineBtn, height: 32, fontSize: 12, padding: '0 12px', marginTop: 10 }}
              >
                ביטול — דלג עליהם
              </button>
            )}
          </div>
        </div>
      )}
      {!showSkuSection && nameMissingCount > 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: '#fdf4ff', border: '1px solid #e9d5ff',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span className="ms" style={{ fontSize: 20, color: '#9333ea', flexShrink: 0 }}>person_off</span>
          <span style={{ fontSize: 13, color: '#6b21a8', flex: 1 }}>
            <strong>{nameMissingCount} לקוחות</strong> יובאו ללא שם — מומלץ להשלים את הנתונים לאחר הייבוא.
          </span>
        </div>
      )}

      {/* SKU auto-gen banner — products only */}
      {showSkuSection && skuMissingCount > 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: autoGenSku ? 'var(--md-primary-container)' : '#fef9c3',
          border: `1px solid ${autoGenSku ? 'var(--md-primary)' : '#fde047'}`,
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <span className="ms" style={{ fontSize: 20, color: autoGenSku ? 'var(--md-primary)' : '#a16207', flexShrink: 0 }}>
            {autoGenSku ? 'auto_fix_high' : 'label_off'}
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            {autoGenSku ? (
              <span style={{ fontSize: 13, color: 'var(--md-on-surface)' }}>
                <strong>{skuMissingCount} מוצרים</strong> יקבלו SKU אוטומטי בפורמט{' '}
                <code style={{ fontSize: 12, background: 'rgba(0,0,0,0.08)', padding: '1px 5px', borderRadius: 4 }}>IMP-XXXXX-0001</code>
                {' '}— ייחודי לחנות שלך
              </span>
            ) : (
              <span style={{ fontSize: 13, color: '#713f12' }}>
                <strong>{skuMissingCount} מוצרים</strong> ללא SKU — לייבא אותם, המערכת תייצר SKU אוטומטי?
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {autoGenSku ? (
              <button
                onClick={() => onSetAutoGenSku(false)}
                style={{ ...outlineBtn, height: 32, fontSize: 13, padding: '0 12px' }}
              >
                ביטול
              </button>
            ) : (
              <>
                <button
                  onClick={() => onSetAutoGenSku(true)}
                  style={{ ...primaryBtn, height: 32, fontSize: 13, padding: '0 14px' }}
                >
                  <span className="ms" style={{ fontSize: 16 }}>auto_fix_high</span>
                  כן, ייצר SKU
                </button>
                <button
                  onClick={() => onSetAutoGenSku(false)}
                  style={{ ...outlineBtn, height: 32, fontSize: 13, padding: '0 12px', color: 'var(--md-on-surface-variant)', borderColor: 'var(--md-outline-variant)' }}
                >
                  דלג עליהם
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* DB conflict strategy */}
      <div style={{
        padding: '12px 16px', borderRadius: 10,
        background: 'var(--md-surface-container)',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span className="ms" style={{ fontSize: 18, color: 'var(--md-primary)' }}>sync_problem</span>
          <span style={{ fontSize: 13, color: 'var(--md-on-surface)', fontWeight: 500 }}>
            {conflictKeyLabel} שכבר קיים במערכת:
          </span>
        </div>
        {conflictOptions.map((opt) => (
          <label
            key={opt}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, cursor: 'pointer',
              color: conflictStrategy === opt ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
              fontWeight: conflictStrategy === opt ? 600 : 400,
            }}
          >
            <input
              type="radio"
              name="conflictStrategy"
              value={opt}
              checked={conflictStrategy === opt}
              onChange={() => onConflictStrategyChange(opt)}
              style={{ accentColor: 'var(--md-primary)', cursor: 'pointer' }}
            />
            {opt === 'skip' ? 'דלג (ברירת מחדל)' : opt === 'merge' ? 'עדכן שדות שסופקו' : 'החלף לגמרי'}
          </label>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--md-outline-variant)', maxHeight: 340, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: 'var(--md-surface-container)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--md-outline-variant)', color: 'var(--md-on-surface-variant)', fontWeight: 600, whiteSpace: 'nowrap' }}>#</th>
              {mappedHeaders.map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--md-outline-variant)', color: 'var(--md-on-surface)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
              <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--md-outline-variant)', color: 'var(--md-on-surface-variant)', fontWeight: 600, whiteSpace: 'nowrap' }}>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {validatedRows.map((vr) => {
              const hasError = vr.errors.length > 0
              const isMissingSku = vr.missingSkuType && !hasError
              const isMissingName = vr.missingName && !hasError
              const isMissingPhone = vr.missingPhone && !vr.missingName && !hasError
              const rowBg = hasError
                ? 'var(--md-error-container)'
                : isMissingSku
                  ? '#fef9c3'
                  : isMissingName
                    ? '#fdf4ff'
                    : isMissingPhone
                      ? '#fff7ed'
                      : undefined
              const textColor = hasError ? 'var(--md-on-error-container)' : 'var(--md-on-surface-variant)'
              return (
                <tr key={vr.rowIndex} style={{ background: rowBg, borderBottom: '1px solid var(--md-outline-variant)' }}>
                  <td style={{ padding: '6px 12px', color: 'var(--md-on-surface-variant)' }}>{vr.rowIndex + 1}</td>
                  {mappedHeaders.map((h) => (
                    <td key={h} style={{ padding: '6px 12px', color: textColor, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {vr.raw[h] ?? ''}
                    </td>
                  ))}
                  <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                    {hasError
                      ? <span title={vr.errors.join(' | ')} style={{ color: 'var(--md-error)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                          <span className="ms" style={{ fontSize: 14 }}>error</span>
                          {vr.errors[0]}{vr.errors.length > 1 ? ` (+${vr.errors.length - 1})` : ''}
                        </span>
                      : isMissingSku
                        ? <span style={{ color: autoGenSku ? 'var(--md-primary)' : '#a16207', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="ms" style={{ fontSize: 14 }}>{autoGenSku ? 'auto_fix_high' : 'label_off'}</span>
                            {autoGenSku ? 'SKU אוטומטי' : 'ללא SKU'}
                          </span>
                        : isMissingName
                          ? <span style={{ color: '#9333ea', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span className="ms" style={{ fontSize: 14 }}>person_off</span>
                              ללא שם
                            </span>
                          : isMissingPhone
                          ? <span style={{ color: '#c2410c', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span className="ms" style={{ fontSize: 14 }}>phone_disabled</span>
                              ללא טלפון
                            </span>
                          : <span style={{ color: 'var(--md-primary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span className="ms" style={{ fontSize: 14 }}>check</span>תקין
                            </span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Done Step ─────────────────────────────────────────────────────────────────

function DoneStep({ result, entityLabel, keyLabel }: { result: ImportResult; entityLabel: string; keyLabel: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--md-primary-container)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="ms" style={{ fontSize: 40, color: 'var(--md-primary)' }}>check_circle</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--md-on-surface)' }}>
          יובאו {result.imported.toLocaleString()} {entityLabel} בהצלחה
        </div>
        {result.failed > 0 && (
          <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
            {result.failed} שורות לא יובאו
          </div>
        )}
      </div>

      {result.errors.length > 0 && (
        <div style={{
          width: '100%', maxHeight: 200, overflowY: 'auto',
          border: '1px solid var(--md-outline-variant)', borderRadius: 10,
          fontSize: 12,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--md-surface-container)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--md-on-surface)' }}>שורה</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--md-on-surface)' }}>{keyLabel}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--md-on-surface)' }}>סיבה</th>
              </tr>
            </thead>
            <tbody>
              {result.errors.map((e, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--md-outline-variant)' }}>
                  <td style={{ padding: '6px 12px', color: 'var(--md-on-surface-variant)' }}>{e.rowIndex + 1}</td>
                  <td style={{ padding: '6px 12px', color: 'var(--md-on-surface-variant)' }}>{e.sku ?? '—'}</td>
                  <td style={{ padding: '6px 12px', color: 'var(--md-error)' }}>{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function hebrewPlural(word: string): string {
  const finalToRegular: Record<string, string> = { 'ף': 'פ', 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ' };
  const last = word[word.length - 1];
  return (finalToRegular[last] ? word.slice(0, -1) + finalToRegular[last] : word) + 'ים';
}

// ── Duplicate Dialog ──────────────────────────────────────────────────────────

function DuplicateDialog({
  groups,
  parsedRows,
  headers,
  mapping,
  keyLabel,
  onChoose,
  onQuickAll,
  onConfirm,
}: {
  groups: IntraFileDuplicateGroup[]
  parsedRows: ParsedRow[]
  headers: string[]
  mapping: ColumnMappingRecord
  keyLabel: string
  onChoose: (sku: string, chosenIndex: number) => void
  onQuickAll: (strategy: 'first' | 'last') => void
  onConfirm: () => void
}) {
  const mappedHeaders = headers.filter((h) => mapping[h]).slice(0, 4)
  const manyGroups = groups.length >= 5

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 700,
          maxHeight: '82vh',
          background: 'var(--md-surface-container-lowest)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-3)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid var(--md-outline-variant)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span className="ms" style={{ fontSize: 24, color: '#f59e0b', flexShrink: 0, marginTop: 2 }}>warning</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--md-on-surface)' }}>
                נמצאו {groups.length} {hebrewPlural(keyLabel)} כפולים בקובץ
              </div>
              <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 3 }}>
                {manyGroups
                  ? `${groups.length} ${hebrewPlural(keyLabel)} מופיעים ביותר משורה אחת. בחר איזו שורה לשמור.`
                  : `בחר איזו שורה לשמור עבור כל ${keyLabel} כפול, לפני שהנתונים יאומתו.`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => onQuickAll('first')}
              style={{ ...primaryBtn, height: 36, fontSize: 13, padding: '0 18px' }}
            >
              <span className="ms" style={{ fontSize: 16 }}>first_page</span>
              שמור ראשון לכולם
            </button>
            <button
              onClick={() => onQuickAll('last')}
              style={{ ...outlineBtn, height: 36, fontSize: 13, padding: '0 14px' }}
            >
              <span className="ms" style={{ fontSize: 16 }}>last_page</span>
              שמור אחרון לכולם
            </button>
          </div>
        </div>

        {/* Groups list — collapsed summary for many groups */}
        {manyGroups ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'var(--md-surface-container)',
              fontSize: 13, color: 'var(--md-on-surface)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span className="ms" style={{ fontSize: 20, color: '#f59e0b', flexShrink: 0, marginTop: 1 }}>info</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {groups.length} {hebrewPlural(keyLabel)} כפולים — רשימה גדולה מדי לתצוגה ידנית
                </div>
                <div style={{ color: 'var(--md-on-surface-variant)', lineHeight: 1.6 }}>
                  זה קורה כשהקובץ מגיע ממערכת שמייצאת שורה אחת לכל הזמנה, אותו לקוח מופיע כמה פעמים.
                  <br />
                  לחץ <strong>שמור ראשון לכולם</strong> כדי לשמור את נתוני השורה הראשונה של כל לקוח.
                </div>
              </div>
            </div>

            <div style={{
              borderRadius: 10, border: '1px solid var(--md-outline-variant)',
              overflow: 'hidden', fontSize: 12,
            }}>
              <div style={{
                padding: '8px 14px',
                background: 'var(--md-surface-container)',
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                fontWeight: 600, color: 'var(--md-on-surface-variant)',
                gap: 12,
              }}>
                <span>{keyLabel}</span>
                <span>שורות בקובץ</span>
                <span>נבחרת</span>
              </div>
              {groups.map((group) => (
                <div key={group.sku} style={{
                  padding: '8px 14px',
                  borderTop: '1px solid var(--md-outline-variant)',
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  gap: 12, alignItems: 'center', color: 'var(--md-on-surface)',
                }}>
                  <code style={{ fontSize: 12 }}>{group.sku}</code>
                  <span style={{ color: 'var(--md-on-surface-variant)', textAlign: 'center' }}>
                    {group.rowIndexes.length}
                  </span>
                  <span style={{ color: 'var(--md-primary)', textAlign: 'center', fontWeight: 600 }}>
                    שורה {(group.chosenIndex ?? group.rowIndexes[0]) + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {groups.map((group) => (
            <div key={group.sku} style={{
              border: '1px solid var(--md-outline-variant)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              <div style={{
                padding: '8px 14px',
                background: 'var(--md-surface-container)',
                fontWeight: 600, fontSize: 13, color: 'var(--md-on-surface)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span className="ms" style={{ fontSize: 16, color: 'var(--md-error)' }}>content_copy</span>
                {keyLabel}:{' '}
                <code style={{ fontSize: 12, background: 'rgba(0,0,0,0.08)', padding: '1px 6px', borderRadius: 4 }}>
                  {group.sku}
                </code>
                <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', fontWeight: 400 }}>
                  — {group.rowIndexes.length} שורות
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--md-surface-container-low)' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--md-on-surface-variant)', fontWeight: 600, width: 44 }}>בחר</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--md-on-surface-variant)', fontWeight: 600, width: 56 }}>שורה</th>
                    {mappedHeaders.map((h) => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--md-on-surface)', fontWeight: 600 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.rowIndexes.map((rowIdx) => {
                    const row = parsedRows[rowIdx]
                    const isChosen = group.chosenIndex === rowIdx
                    return (
                      <tr
                        key={rowIdx}
                        onClick={() => onChoose(group.sku, rowIdx)}
                        style={{
                          background: isChosen ? 'var(--md-primary-container)' : undefined,
                          borderTop: '1px solid var(--md-outline-variant)',
                          cursor: 'pointer',
                          transition: 'background 0.1s',
                        }}
                      >
                        <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                          <input
                            type="radio"
                            name={`dup-${group.sku}`}
                            checked={isChosen}
                            onChange={() => onChoose(group.sku, rowIdx)}
                            style={{ accentColor: 'var(--md-primary)', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '6px 10px', color: 'var(--md-on-surface-variant)', fontWeight: isChosen ? 600 : 400 }}>
                          {rowIdx + 1}
                        </td>
                        {mappedHeaders.map((h) => (
                          <td key={h} style={{
                            padding: '6px 10px',
                            color: isChosen ? 'var(--md-on-surface)' : 'var(--md-on-surface-variant)',
                            maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {row?.[h] ?? ''}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--md-outline-variant)',
          display: 'flex', justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <button onClick={onConfirm} style={primaryBtn}>
            <span className="ms" style={{ fontSize: 18 }}>check_circle</span>
            המשך לאימות
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  height: 40, padding: '0 20px', borderRadius: 999,
  background: 'var(--md-primary)', color: 'var(--md-on-primary)',
  border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
}

const outlineBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  height: 40, padding: '0 16px', borderRadius: 999,
  background: 'transparent', color: 'var(--md-primary)',
  border: '1px solid var(--md-outline)',
  cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
}

const disabledBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  height: 40, padding: '0 20px', borderRadius: 999,
  background: 'var(--md-outline-variant)', color: 'var(--md-on-surface-variant)',
  border: 'none', cursor: 'not-allowed',
  fontFamily: 'inherit', fontSize: 14, fontWeight: 500, opacity: 0.6,
}

const selectStyle: React.CSSProperties = {
  width: '100%', height: 34, padding: '0 8px', borderRadius: 8,
  border: '1px solid var(--md-outline-variant)',
  background: 'var(--md-surface-container-lowest)',
  color: 'var(--md-on-surface)', fontFamily: 'inherit', fontSize: 12,
  cursor: 'pointer',
}
