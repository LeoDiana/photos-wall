export interface ImageData {
  id: string
  src: string
  x: number | null
  y: number | null
  originalWidth: number
  originalHeight: number
  order: number
  scale: number
  xOffset: number | null
  yOffset: number | null
}

export interface Position {
  x: number | null
  y: number | null
}
