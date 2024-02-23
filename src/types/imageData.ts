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
  rotation: number
}

export interface Position {
  x: number | null
  y: number | null
}
