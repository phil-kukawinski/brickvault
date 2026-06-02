const REBRICKABLE_API_KEY = import.meta.env.VITE_REBRICKABLE_API_KEY
const BASE_URL = 'https://rebrickable.com/api/v3/lego'

export type LegoSet = {
  set_num: string
  name: string
  year: number
  theme_id: number
  num_parts: number
  set_img_url: string
  set_url: string
  theme?: string
}

export async function fetchSetByBarcode(barcode: string): Promise<LegoSet | null> {
  try {
    const setNum = `${barcode}-1`
    const response = await fetch(`${BASE_URL}/sets/${setNum}/`, {
      headers: { Authorization: `key ${REBRICKABLE_API_KEY}` }
    })
    if (!response.ok) return null
    return await response.json() as LegoSet
  } catch {
    return null
  }
}

export async function fetchSetBySetNum(setNum: string): Promise<LegoSet | null> {
  try {
    const response = await fetch(`${BASE_URL}/sets/${setNum}/`, {
      headers: { Authorization: `key ${REBRICKABLE_API_KEY}` }
    })
    if (!response.ok) return null
    return await response.json() as LegoSet
  } catch {
    return null
  }
}

export async function searchSets(query: string): Promise<LegoSet[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/sets/?search=${encodeURIComponent(query)}&page_size=20`,
      { headers: { Authorization: `key ${REBRICKABLE_API_KEY}` } }
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.results as LegoSet[]
  } catch {
    return []
  }
}

export async function fetchThemeById(themeId: number): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/themes/${themeId}/`, {
      headers: { Authorization: `key ${REBRICKABLE_API_KEY}` }
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.name as string
  } catch {
    return null
  }
}

export async function fetchSetPrice(setNum: string): Promise<number | null> {
  try {
    const response = await fetch(`${BASE_URL}/sets/${setNum}/`, {
      headers: { Authorization: `key ${REBRICKABLE_API_KEY}` }
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.retail_price ?? null
  } catch {
    return null
  }
}