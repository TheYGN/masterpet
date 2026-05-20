/**
 * Screen: products-list
 * Design source: designs/MasterPet/designs/products-list/
 * Role: All dashboard roles (owner sees cost_price, others read-only)
 * Phase: MVP
 */
import { requireActiveTenant } from '@/app/lib/dal'
import { listProductsAction } from './actions'
import type { AnimalType, DietType, ProductStatus, ListProductsFilters } from './types'
import { ProductsClient } from './_components/ProductsClient'

// ---- helpers ----
function toAnimalType(v: string | undefined): AnimalType | undefined {
  const valid: AnimalType[] = ['dog', 'cat', 'rodent', 'bird', 'fish', 'reptile', 'other']
  return valid.includes(v as AnimalType) ? (v as AnimalType) : undefined
}
function toDietType(v: string | undefined): DietType | undefined {
  const valid: DietType[] = ['regular', 'grain_free', 'hypoallergenic', 'super_premium', 'therapeutic']
  return valid.includes(v as DietType) ? (v as DietType) : undefined
}
function toStatus(v: string | undefined): ProductStatus | undefined {
  const valid: ProductStatus[] = ['active', 'inactive', 'discontinued']
  return valid.includes(v as ProductStatus) ? (v as ProductStatus) : undefined
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireActiveTenant()
  const sp = await searchParams

  const filters: ListProductsFilters = {
    animal_type: toAnimalType(Array.isArray(sp.animal) ? sp.animal[0] : sp.animal),
    diet_type: toDietType(Array.isArray(sp.diet) ? sp.diet[0] : sp.diet),
    status: toStatus(Array.isArray(sp.status) ? sp.status[0] : sp.status),
    search: Array.isArray(sp.q) ? sp.q[0] : sp.q,
  }

  const result = await listProductsAction(filters)
  const products = result.data ?? []

  return (
    <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <ProductsClient initialProducts={products} initialFilters={filters} />
    </div>
  )
}
