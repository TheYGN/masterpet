// No 'server-only' — pure logic, usable from both the client (preview) and the
// server action (insertion). Runs AFTER column mapping/validation, BEFORE DB insert.
//
// Purpose: the importer currently treats every row as a standalone product+variant
// (flat). This hook detects rows that are really variants of one parent product
// (same brand/category + same dimension unit, names sharing a common prefix) and
// folds them into a relational Parent → Variants[] shape, capturing the per-row
// flavor + dimension. The import action maps these onto the project's existing EAV
// tables (product_attributes / product_attribute_values / variant_attribute_values),
// the same structure manual product creation uses — so imported and hand-made
// products are indistinguishable to the rest of the app.
//
// Design note — token-based LCP, not character-based:
// A naive character-level longest-common-prefix breaks mid-word
// ("MONGE Tray Pate Beef" vs "MONGE Tray Patatas" → "MONGE Tray Pat"), which would
// invent a garbage parent name. We compute the LCP over whitespace tokens (words),
// so the prefix always lands on a word boundary. This also makes the "≥ 2 words"
// safeguard a natural, exact check rather than a fuzzy character count.

import type { ImportRowData } from './import-types'

// The per-variant attribute matrix the import action maps onto the EAV tables
// (flavor → "טעם" value, quantity+unit → "גודל" value). `quantity`/`unit` are
// descriptive product dimensions (100 gram, 30 cm, …) — NOT stock, NOT shipping weight.
export interface VariantAttributes {
  flavor: string          // remainder of the product name after the shared prefix
  quantity: number | null // size value from the file's "Quantity" column
  unit: string | null     // size unit from the file's "Unit" column (free text)
}

// One variant after normalization. `variant`/`inventory` carry the original mapped
// values so DB wiring keeps every field it had before.
export interface NormalizedVariant {
  attributes: VariantAttributes
  variant: ImportRowData['variant']
  inventory: ImportRowData['inventory']
}

// One parent product plus its variants. A singleton (row that wasn't grouped) comes
// back as a parent with exactly one variant and `grouped: false` — so the hook is
// loss-free: every input row is represented in exactly one output variant.
export interface NormalizedProduct {
  parent: ImportRowData['product']  // shared product fields; `name` overwritten with the LCP for real groups
  variants: NormalizedVariant[]
  grouped: boolean                  // true only when ≥2 rows folded under a real ≥minPrefixWords prefix
  sourceRowIndexes: number[]        // original positions, aligned 1:1 with `variants`, for error reporting
}

export interface NormalizationOptions {
  // Minimum number of shared leading words required to treat rows as one product.
  // The spec's safeguard against falsely grouping unrelated items. Default 2.
  minPrefixWords?: number
  // Derives the bucket key: rows group only when this matches. Default = category
  // signature + dimension unit. Override to bucket by supplier_name, etc.
  groupKey?: (row: ImportRowData) => string
}

const DEFAULT_MIN_PREFIX_WORDS = 2

function dimensionUnit(row: ImportRowData): string {
  return (row.dimensions?.unit ?? '').trim().toLowerCase()
}

function dimensionQuantity(row: ImportRowData): number | null {
  const q = row.dimensions?.quantity
  return typeof q === 'number' && !isNaN(q) ? q : null
}

// Bucket key: same category set AND same dimension unit. Categories are normalized
// (trimmed, lowercased, sorted) so order/casing differences don't split a group.
function defaultGroupKey(row: ImportRowData): string {
  const cats = (row.product.categories ?? [])
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join('|')
  return `${cats}::${dimensionUnit(row)}`
}

function tokenize(name: string): string[] {
  // Israeli Excel exports routinely contain non-breaking spaces (U+00A0) and bidi
  // control marks (U+200E/U+200F) around Hebrew/Latin runs. \s+ alone won't split on
  // them, which would glue tokens together and silently defeat the word-level LCP —
  // so normalize them to plain spaces first.
  return name.replace(/[\u00a0\u200e\u200f]/g, ' ').trim().split(/\s+/).filter(Boolean)
}

// Common leading words of two token arrays, compared case-insensitively but returning
// the original-cased tokens from `a`.
function commonPrefixWords(a: string[], b: string[]): string[] {
  let j = 0
  while (j < a.length && j < b.length && a[j].toLowerCase() === b[j].toLowerCase()) j++
  return a.slice(0, j)
}

function attributesOf(row: ImportRowData, flavor: string): VariantAttributes {
  return {
    flavor,
    quantity: dimensionQuantity(row),
    // Stored case-preserved for display (e.g. "Kg"). Bucketing uses dimensionUnit()
    // which lowercases — intentional: the bucket key normalizes, the shown value doesn't.
    unit: row.dimensions?.unit?.trim() || null,
  }
}

// Turns a single row into its own (ungrouped) parent — the degenerate, loss-free case.
function singleton(row: ImportRowData, rowIndex: number): NormalizedProduct {
  return {
    parent: { ...row.product },
    variants: [{ attributes: attributesOf(row, ''), variant: row.variant, inventory: row.inventory }],
    grouped: false,
    sourceRowIndexes: [rowIndex],
  }
}

interface ClusterEntry {
  row: ImportRowData
  index: number
  tokens: string[]
  sortKey: string
}

// Cluster the rows of ONE bucket into product families. A bucket can hold several
// unrelated families (e.g. MONGE / MATCH / ERA all under one category, or — when no
// category column is mapped — the entire file), so a single bucket-wide LCP is wrong:
// it collapses to nothing and everything falls out as singletons. Instead we sort by
// name so prefix-sharing rows sit adjacent, then accumulate runs whose RUNNING LCP
// stays ≥ minPrefixWords. Each run of ≥2 rows becomes one parent; the rest are
// singletons. Loss-free: every row ends in exactly one output product.
function clusterByPrefix(
  bucketRows: ImportRowData[],
  indexes: number[],
  minPrefixWords: number
): NormalizedProduct[] {
  const entries: ClusterEntry[] = bucketRows.map((row, i) => {
    const tokens = tokenize(row.product.name)
    return { row, index: indexes[i], tokens, sortKey: tokens.join(' ').toLowerCase() }
  })
  // Sort is by UTF-16 code units, not locale collation. That's fine here: the algorithm
  // only needs prefix-sharing names to sit ADJACENT, and shared prefixes always sort
  // together under code-unit order. Don't rely on this ordering for anything user-facing.
  entries.sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))

  const out: NormalizedProduct[] = []
  let cluster: ClusterEntry[] = []
  let prefix: string[] = []

  const flush = () => {
    if (cluster.length >= 2 && prefix.length >= minPrefixWords) {
      const prefixLen = prefix.length
      out.push({
        parent: { ...cluster[0].row.product, name: prefix.join(' ') },
        variants: cluster.map((e) => {
          const flavor = e.tokens.slice(prefixLen).join(' ').trim()
          return { attributes: attributesOf(e.row, flavor), variant: e.row.variant, inventory: e.row.inventory }
        }),
        grouped: true,
        sourceRowIndexes: cluster.map((e) => e.index),
      })
    } else {
      for (const e of cluster) out.push(singleton(e.row, e.index))
    }
    cluster = []
    prefix = []
  }

  for (const e of entries) {
    if (cluster.length === 0) {
      cluster = [e]
      prefix = e.tokens
      continue
    }
    const lcp = commonPrefixWords(prefix, e.tokens)
    if (lcp.length >= minPrefixWords) {
      cluster.push(e)
      prefix = lcp // running LCP of all members so far
    } else {
      flush()
      cluster = [e]
      prefix = e.tokens
    }
  }
  flush()
  return out
}

/**
 * The Data Normalization Hook.
 *
 * @param rows   validated, mapped rows (in original file order)
 * @returns      parent products, each with one or more variants. Loss-free:
 *               sum of variants across all results === rows.length.
 */
export function normalizeImportRows(
  rows: ImportRowData[],
  options: NormalizationOptions = {}
): NormalizedProduct[] {
  const minPrefixWords = options.minPrefixWords ?? DEFAULT_MIN_PREFIX_WORDS
  const groupKey = options.groupKey ?? defaultGroupKey

  // 1. Bucket by (category set + dimension unit), preserving first-seen order.
  const buckets = new Map<string, { rows: ImportRowData[]; indexes: number[] }>()
  rows.forEach((row, idx) => {
    const key = groupKey(row)
    const bucket = buckets.get(key) ?? { rows: [], indexes: [] }
    bucket.rows.push(row)
    bucket.indexes.push(idx)
    buckets.set(key, bucket)
  })

  const result: NormalizedProduct[] = []

  // 2. Within each bucket, cluster rows into product families by shared name prefix.
  for (const { rows: bucketRows, indexes } of buckets.values()) {
    if (bucketRows.length < 2) {
      result.push(singleton(bucketRows[0], indexes[0]))
      continue
    }
    result.push(...clusterByPrefix(bucketRows, indexes, minPrefixWords))
  }

  return result
}
