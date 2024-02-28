export interface DefinedPosition {
  x: number
  y: number
}

export interface Dimensions {
  width: number
  height: number
}

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
  borderWidth: number
  borderHeight: number
}

export interface Position {
  x: number | null
  y: number | null
}
