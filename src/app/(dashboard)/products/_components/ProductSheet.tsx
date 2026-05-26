'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type {
  AnimalType,
  AgeGroup,
  DietType,
  VariantUnit,
  ProductWithVariants,
  UpdateProductInput,
  UpdateVariantInput,
} from '../types'
import {
  addVariantsToProductAction,
  archiveVariantAction,
  createProductAction,
  deleteAttributeAction,
  updateInventoryAction,
  updateProductAction,
  updateVariantAction,
} from '../actions'
import { AttributeBuilder, type AttributeDraft } from './AttributeBuilder'
import { VariantsEditor, type VariantDraft, syncVariants } from './VariantsEditor'
import { SectionHeader, FormRow, TextInput, SelectInput } from './sheet-shared'
import { ProductImageUpload } from './ProductImageUpload'

// ── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  name: string
  description: string
  supplierName: string
  animalType: AnimalType
  ageGroup: AgeGroup
  dietType: DietType
  vatRate: string
  allergenFree: string[]
  tags: string[]
  categories: string[]
  tagInput: string
  attributes: AttributeDraft[]
  variants: VariantDraft[]
  imageUrl: string | null
}

const INITIAL: FormState = {
  name: '',
  description: '',
  supplierName: '',
  animalType: 'dog',
  ageGroup: 'adult',
  dietType: 'regular',
  vatRate: '18',
  allergenFree: [],
  tags: [],
  categories: [],
  tagInput: '',
  attributes: [],
  variants: [],
  imageUrl: null,
}

// ── Build FormState from existing product (edit mode) ─────────────────────────

function buildFormStateFromProduct(p: ProductWithVariants): FormState {
  // Lookups: attribute_value_id -> { attrName, valueText }
  const valueIdToAttrName = new Map<string, string>()
  const valueIdToText = new Map<string, string>()
  for (const a of p.attributes) {
    for (const v of a.values) {
      valueIdToAttrName.set(v.id, a.name)
      valueIdToText.set(v.id, v.value)
    }
  }

  const attributes: AttributeDraft[] = p.attributes.map((a) => ({
    id: a.id,
    name: a.name,
    values: a.values.map((v) => v.value),
  }))

  const variants: VariantDraft[] = p.variants.map((v) => {
    const combination: Record<string, string> = {}
    for (const avid of v.attribute_value_ids) {
      const attrName = valueIdToAttrName.get(avid)
      const text = valueIdToText.get(avid)
      if (attrName && text) combination[attrName] = text
    }
    const inv = p.inventory.find((i) => i.variant_id === v.id)
    return {
      id: v.id,
      combination,
      sku: v.sku,
      price: String(v.price),
      costPrice: v.cost_price != null ? String(v.cost_price) : '',
      barcode: v.barcode ?? '',
      unit: v.unit,
      status: v.status,
      inventoryQty: inv ? String(inv.qty) : '',
      inventoryReorderLevel: inv ? String(inv.reorder_level) : '',
      inventoryId: inv?.id,
    }
  })

  return {
    name: p.product.name,
    description: p.product.description ?? '',
    supplierName: p.product.supplier_name ?? '',
    animalType: p.product.animal_type,
    ageGroup: p.product.age_group,
    dietType: p.product.diet_type,
    vatRate: String(p.product.vat_rate),
    allergenFree: p.product.allergen_free ?? [],
    tags: p.product.tags ?? [],
    categories: p.product.categories ?? [],
    tagInput: '',
    attributes,
    variants,
    imageUrl: p.product.image_url,
  }
}

// ── Build server-action input ─────────────────────────────────────────────────

function buildInput(form: FormState) {
  const { attributes, variants } = form
  const vatNum = parseFloat(form.vatRate)

  return {
    name: form.name,
    description: form.description || null,
    image_url: form.imageUrl || null,
    supplier_name: form.supplierName || null,
    animal_type: form.animalType,
    age_group: form.ageGroup,
    diet_type: form.dietType,
    vat_rate: isNaN(vatNum) ? 18 : vatNum,
    allergen_free: form.allergenFree,
    tags: form.tags,
    categories: form.categories,
    attributes: attributes.map(a => ({ name: a.name, values: a.values })),
    variants: variants.map(v => ({
      sku: v.sku,
      barcode: v.barcode || null,
      price: parseFloat(v.price) || 0,
      cost_price: v.costPrice ? parseFloat(v.costPrice) : null,
      unit: v.unit,
      attribute_value_indices: Object.entries(v.combination)
        .map(([attrName, valueText]) => {
          const attrIdx = attributes.findIndex(a => a.name === attrName)
          const valueIdx = attrIdx >= 0 ? attributes[attrIdx].values.indexOf(valueText) : -1
          return { attr_index: attrIdx, value_index: valueIdx }
        })
        .filter(({ attr_index, value_index }) => attr_index >= 0 && value_index >= 0),
      initial_qty: v.inventoryQty ? parseInt(v.inventoryQty) : null,
      initial_reorder_level: v.inventoryReorderLevel ? parseInt(v.inventoryReorderLevel) : null,
    })),
  }
}

// ── ProductSheet ──────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
  mode?: 'create' | 'edit'
  initialProduct?: ProductWithVariants
}

export function ProductSheet({ onClose, mode = 'create', initialProduct }: Props) {
  const isEdit = mode === 'edit' && initialProduct != null
  const [form, setForm] = useState<FormState>(() =>
    isEdit ? buildFormStateFromProduct(initialProduct) : INITIAL
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [removedCombos, setRemovedCombos] = useState<ReadonlySet<string>>(() => new Set())
  const router = useRouter()

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // Sync variants whenever attributes change — respects user-deleted combos
  const setAttributes = (attrs: AttributeDraft[]) =>
    setForm(prev => ({
      ...prev,
      attributes: attrs,
      variants: syncVariants(attrs, prev.variants, removedCombos),
    }))

  const removeVariant = (id: string) => {
    const variant = form.variants.find(v => v.id === id)
    if (!variant) return
    const key = JSON.stringify(variant.combination)
    setRemovedCombos(prev => new Set([...prev, key]))
    setForm(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== id) }))
  }

  const archiveVariant = async (id: string) => {
    const result = await archiveVariantAction(id)
    if (result.error) { setSubmitError(result.error); return }
    setForm(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== id) }))
  }

  const handleDeleteAttribute = async (attributeId: string) => {
    setSubmitError(null)
    const result = await deleteAttributeAction(attributeId)
    if (result.error) { setSubmitError(result.error); return }
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.filter(a => a.id !== attributeId),
      variants: syncVariants(
        prev.attributes.filter(a => a.id !== attributeId),
        prev.variants,
        removedCombos,
      ),
    }))
    router.refresh()
  }

  const addTag = (raw: string) => {
    const t = raw.trim()
    if (!t || form.tags.includes(t)) return
    setForm(prev => ({ ...prev, tags: [...prev.tags, t], tagInput: '' }))
  }

  const removeTag = (tag: string) => set('tags', form.tags.filter(t => t !== tag))

  const vatNum = parseFloat(form.vatRate)
  const effectiveVat = isNaN(vatNum) ? 18 : vatNum

  const handleSubmit = () => {
    setSubmitError(null)
    startTransition(async () => {
      if (!isEdit) {
        const result = await createProductAction(buildInput(form))
        if (result.error) {
          setSubmitError(result.error)
          return
        }
        router.refresh()
        onClose()
        return
      }

      // Edit mode — update product fields, patch changed existing variants,
      // and add any new attribute values / attributes / variants.
      const productId = initialProduct.product.id
      const productPatch: UpdateProductInput = {
        name: form.name,
        description: form.description || null,
        image_url: form.imageUrl || null,
        supplier_name: form.supplierName || null,
        animal_type: form.animalType,
        age_group: form.ageGroup,
        diet_type: form.dietType,
        vat_rate: effectiveVat,
        tags: form.tags,
        categories: form.categories,
        allergen_free: form.allergenFree,
      }
      const productResult = await updateProductAction(productId, productPatch)
      if (productResult.error) {
        setSubmitError(productResult.error)
        return
      }

      // Patch existing variants that changed
      const existingVariantIds = new Set(initialProduct.variants.map((v) => v.id))
      for (const v of form.variants) {
        const orig = initialProduct.variants.find((o) => o.id === v.id)
        if (!orig) continue
        const patch: UpdateVariantInput = {}
        if (v.sku.trim() !== orig.sku) patch.sku = v.sku.trim()
        const newPrice = parseFloat(v.price) || 0
        if (newPrice !== orig.price) patch.price = newPrice
        const origCost = orig.cost_price ?? null
        const newCost = v.costPrice ? parseFloat(v.costPrice) : null
        if (newCost !== origCost) patch.cost_price = newCost
        const origBarcode = orig.barcode ?? ''
        const newBarcode = v.barcode.trim()
        if (newBarcode !== origBarcode) patch.barcode = newBarcode || null
        if (v.status !== orig.status) patch.status = v.status

        if (Object.keys(patch).length > 0) {
          const r = await updateVariantAction(v.id, patch)
          if (r.error) {
            setSubmitError(r.error)
            return
          }
        }

        // Update inventory if changed
        if (v.inventoryId) {
          const origInv = initialProduct.inventory.find((i) => i.id === v.inventoryId)
          if (origInv) {
            const newQty = v.inventoryQty ? parseInt(v.inventoryQty) : 0
            const newReorder = v.inventoryReorderLevel ? parseInt(v.inventoryReorderLevel) : 0
            if (newQty !== origInv.qty || newReorder !== origInv.reorder_level) {
              const r = await updateInventoryAction(v.inventoryId, {
                qty: newQty,
                reorder_level: newReorder,
              })
              if (r.error) {
                setSubmitError(r.error)
                return
              }
            }
          }
        }
      }

      // Compute new attribute values added to existing attributes
      const attributeValueAdditions: Array<{ attributeId: string; newValues: string[] }> = []
      for (const formAttr of form.attributes) {
        const origAttr = initialProduct.attributes.find((a) => a.id === formAttr.id)
        if (!origAttr) continue
        const origValueSet = new Set(origAttr.values.map((v) => v.value))
        const newValues = formAttr.values.filter((v) => !origValueSet.has(v))
        if (newValues.length > 0) {
          attributeValueAdditions.push({ attributeId: formAttr.id, newValues })
        }
      }

      // Compute brand-new attributes (not in initialProduct)
      const existingAttrIds = new Set(initialProduct.attributes.map((a) => a.id))
      const newAttributes = form.attributes
        .filter((a) => !existingAttrIds.has(a.id))
        .map((a) => ({ name: a.name, values: a.values }))

      // Compute new variants (not in initialProduct)
      const newVariants = form.variants
        .filter((v) => !existingVariantIds.has(v.id))
        .map((v) => ({
          sku: v.sku,
          barcode: v.barcode || null,
          price: parseFloat(v.price) || 0,
          cost_price: v.costPrice ? parseFloat(v.costPrice) : null,
          unit: v.unit,
          combination: v.combination,
        }))

      if (
        attributeValueAdditions.length > 0 ||
        newAttributes.length > 0 ||
        newVariants.length > 0
      ) {
        const addResult = await addVariantsToProductAction({
          productId,
          attributeValueAdditions,
          newAttributes,
          newVariants,
        })
        if (addResult.error) {
          setSubmitError(addResult.error)
          return
        }
      }

      router.refresh()
      onClose()
    })
  }

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <aside style={{
        position: 'fixed', left: 0, top: 0,
        width: 680, height: '100vh',
        background: 'var(--md-surface-container-lowest)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.20)',
        borderInlineEnd: '1px solid var(--md-outline-variant)',
        display: 'flex', flexDirection: 'column',
        zIndex: 50,
      }}>

        {/* ── Header ── */}
        <header style={{
          height: 64, padding: '0 24px', flexShrink: 0,
          borderBottom: '1px solid var(--md-outline-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--md-on-surface)', lineHeight: 1.2 }}>
              {isEdit ? 'עריכת מוצר' : 'מוצר חדש'}
            </div>
            <nav style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 2,
            }}>
              <span>קטלוג</span>
              <span className="ms" style={{
                fontSize: 14, display: 'inline-block', transform: 'scaleX(-1)',
              }}>chevron_left</span>
              <span style={{
                color: 'var(--md-on-surface)', fontWeight: 500,
                maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {isEdit ? initialProduct.product.name : 'מוצר חדש'}
              </span>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isEdit && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 999,
                background: 'var(--md-surface-container)',
                fontSize: 11, color: 'var(--md-on-surface-variant)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 3, background: 'var(--md-warning)',
                  boxShadow: '0 0 0 4px rgba(245,158,11,0.18)',
                }} />
                טיוטה — לא נשמר
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              title="סגור"
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: 'var(--md-on-surface-variant)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="ms" style={{ fontSize: 22 }}>close</span>
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{
          flex: 1, overflowY: 'auto', minHeight: 0,
          padding: '24px 24px 32px',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>

          {/* Section — Image */}
          <section>
            <SectionHeader title="תמונת מוצר" sub="אופציונלי" />
            <ProductImageUpload
              value={form.imageUrl}
              onChange={(url) => set('imageUrl', url)}
            />
          </section>

          <Divider />

          {/* Section A — Product basics */}
          <section>
            <SectionHeader title="פרטי מוצר" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormRow label="שם מוצר" required>
                <TextInput
                  value={form.name}
                  onChange={v => set('name', v)}
                  placeholder="לדוגמה: Royal Canin Maxi Adult"
                />
              </FormRow>
              <FormRow label="תיאור">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="תיאור קצר של המוצר (אופציונלי)"
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'var(--md-surface-container-lowest)',
                    border: '1px solid var(--md-outline-variant)',
                    fontFamily: 'inherit', fontSize: 13,
                    color: 'var(--md-on-surface)', outline: 'none',
                    resize: 'vertical', direction: 'rtl',
                    boxSizing: 'border-box' as const,
                  }}
                />
              </FormRow>
              <FormRow label="שם ספק">
                <TextInput
                  value={form.supplierName}
                  onChange={v => set('supplierName', v)}
                  placeholder="לדוגמה: Royal Canin Israel"
                />
              </FormRow>
            </div>
          </section>

          <Divider />

          {/* Section B — Taxonomy */}
          <section>
            <SectionHeader title="טקסונומיה" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormRow label="סוג חיה" required>
                <SelectInput<AnimalType>
                  value={form.animalType}
                  onChange={v => set('animalType', v)}
                  options={[
                    { value: 'dog', label: 'כלב' },
                    { value: 'cat', label: 'חתול' },
                    { value: 'rodent', label: 'מכרסמים' },
                    { value: 'bird', label: 'ציפורים' },
                    { value: 'fish', label: 'דגים' },
                    { value: 'reptile', label: 'זוחל' },
                    { value: 'other', label: 'אחר' },
                  ]}
                />
              </FormRow>
              <FormRow label="קבוצת גיל" required>
                <SelectInput<AgeGroup>
                  value={form.ageGroup}
                  onChange={v => set('ageGroup', v)}
                  options={[
                    { value: 'puppy', label: 'גור / גוּרה' },
                    { value: 'adult', label: 'בוגר' },
                    { value: 'senior', label: 'זקן' },
                    { value: 'all', label: 'כל הגילאים' },
                  ]}
                />
              </FormRow>
              <FormRow label="סוג דיאטה" required>
                <SelectInput<DietType>
                  value={form.dietType}
                  onChange={v => set('dietType', v)}
                  options={[
                    { value: 'regular', label: 'רגיל' },
                    { value: 'grain_free', label: 'ללא דגנים' },
                    { value: 'hypoallergenic', label: 'היפואלרגני' },
                    { value: 'super_premium', label: 'סופר פרמיום' },
                    { value: 'therapeutic', label: 'תרפויטי' },
                  ]}
                />
              </FormRow>
              <FormRow label='מע"מ (%)' required>
                <input
                  type="number"
                  value={form.vatRate}
                  onChange={e => set('vatRate', e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                  style={{
                    width: '100%', height: 40, padding: '0 12px', borderRadius: 8,
                    background: 'var(--md-surface-container-lowest)',
                    border: '1px solid var(--md-outline-variant)',
                    fontFamily: 'inherit', fontSize: 13,
                    color: 'var(--md-on-surface)', outline: 'none',
                    direction: 'ltr', boxSizing: 'border-box' as const,
                  }}
                />
              </FormRow>
            </div>

            {/* Tags */}
            <div style={{ marginTop: 14 }}>
              <FormRow label="תגיות">
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8,
                  alignItems: 'center', minHeight: 40,
                }}>
                  {form.tags.map(tag => (
                    <span key={tag} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px 3px 10px', borderRadius: 999,
                      background: 'var(--md-surface-container-high)',
                      color: 'var(--md-on-surface)', fontSize: 12, fontWeight: 500,
                    }}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        style={{
                          width: 14, height: 14, borderRadius: '50%',
                          border: 'none', background: 'transparent',
                          color: 'var(--md-on-surface-variant)', cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <span className="ms" style={{ fontSize: 12 }}>close</span>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="הוסף תגית…"
                    value={form.tagInput}
                    onChange={e => set('tagInput', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        addTag(form.tagInput)
                      }
                    }}
                    onBlur={() => { if (form.tagInput.trim()) addTag(form.tagInput) }}
                    style={{
                      minWidth: 100, height: 30, padding: '0 10px', borderRadius: 8,
                      background: 'var(--md-surface-container-lowest)',
                      border: '1px dashed var(--md-outline-variant)',
                      fontFamily: 'inherit', fontSize: 12,
                      color: 'var(--md-on-surface)', outline: 'none', direction: 'rtl',
                    }}
                  />
                </div>
              </FormRow>
            </div>
          </section>

          <Divider />

          {/* Section C — Attributes */}
          {isEdit ? (() => {
            // Attrs whose values are referenced by active (non-archived) variants
            const variantValueIds = new Set(
              initialProduct.variants.flatMap((v) => v.attribute_value_ids),
            )
            const usedAttrIds = new Set(
              initialProduct.attributes
                .filter((a) => a.values.some((v) => variantValueIds.has(v.id)))
                .map((a) => a.id),
            )
            // Attrs that exist in DB but have no active variants — safe to delete
            const deletableExistingAttrIds = new Set(
              initialProduct.attributes
                .filter((a) => !usedAttrIds.has(a.id))
                .map((a) => a.id),
            )
            return (
              <AttributeBuilder
                attributes={form.attributes}
                onChange={setAttributes}
                hideVariantCount
                lockedAttrIds={usedAttrIds}
                deletableExistingAttrIds={deletableExistingAttrIds}
                onDeleteExisting={handleDeleteAttribute}
                lockedValueSets={
                  new Map(
                    initialProduct.attributes.map((a) => [
                      a.id,
                      new Set(a.values.map((v) => v.value)),
                    ]),
                  )
                }
              />
            )
          })() : (
            <AttributeBuilder attributes={form.attributes} onChange={setAttributes} />
          )}

          {/* Section D — Variants (only if attributes produce combos) */}
          {form.variants.length > 0 && (
            <>
              <Divider />
              <VariantsEditor
                attributes={form.attributes}
                variants={form.variants}
                vatRate={effectiveVat}
                onChange={variants => set('variants', variants)}
                onRemove={isEdit ? undefined : removeVariant}
                onArchive={isEdit ? archiveVariant : undefined}
              />
            </>
          )}

          {/* Submit error */}
          {submitError && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'var(--md-error-container)', color: 'var(--md-on-error-container)',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="ms" style={{ fontSize: 18, flexShrink: 0 }}>error</span>
              {submitError}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer style={{
          height: 72, padding: '0 24px', flexShrink: 0,
          background: 'var(--md-surface-container-lowest)',
          borderTop: '1px solid var(--md-outline-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 40, padding: '0 20px', borderRadius: 999,
                background: isPending ? 'var(--md-surface-container)' : 'var(--md-primary)',
                color: isPending ? 'var(--md-on-surface-variant)' : 'var(--md-on-primary)',
                border: 'none', cursor: isPending ? 'default' : 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                transition: 'all 120ms',
              }}
            >
              <span className="ms" style={{ fontSize: 18 }}>
                {isPending ? 'hourglass_empty' : 'check'}
              </span>
              {isPending ? 'שומר…' : isEdit ? 'עדכן מוצר' : 'שמור מוצר'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{
              height: 40, padding: '0 18px', borderRadius: 999,
              background: 'transparent', color: 'var(--md-on-surface-variant)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
            }}
          >
            בטל
          </button>
        </footer>
      </aside>
    </>
  )
}

function Divider() {
  return (
    <hr style={{ border: 'none', borderTop: '1px solid var(--md-outline-variant)', margin: 0 }} />
  )
}
