const REBRICKABLE_API_KEY = process.env.EXPO_PUBLIC_REBRICKABLE_API_KEY!
const BASE_URL = 'https://rebrickable.com/api/v3/lego'

export type LegoSet = {
  set_num: string
  name: string
  year: number
  theme_id: number
  num_parts: number
  set_img_url: string
  set_url: string
}

export async function fetchSetByBarcode(barcode: string): Promise<LegoSet | null> {
  try {
    // Rebrickable set numbers are formatted like "12345-1"
    // Barcodes on LEGO boxes are the set number without the "-1" suffix
    const setNum = `${barcode}-1`

    const response = await fetch(`${BASE_URL}/sets/${setNum}/`, {
      headers: {
        Authorization: `key ${REBRICKABLE_API_KEY}`
      }
    })

    if (!response.ok) return null

    const data = await response.json()
    return data as LegoSet
  } catch {
    return null
  }
}

export async function fetchSetBySetNum(setNum: string): Promise<LegoSet | null> {
  try {
    const response = await fetch(`${BASE_URL}/sets/${setNum}/`, {
      headers: {
        Authorization: `key ${REBRICKABLE_API_KEY}`
      }
    })

    if (!response.ok) return null

    const data = await response.json()
    return data as LegoSet
  } catch {
    return null
  }
}
export async function searchSets(query: string): Promise<LegoSet[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/sets/?search=${encodeURIComponent(query)}&page_size=20`,
      {
        headers: {
          Authorization: `key ${REBRICKABLE_API_KEY}`
        }
      }
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.results as LegoSet[]
  } catch {
    return []
  }
}