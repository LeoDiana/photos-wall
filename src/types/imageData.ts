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
  imageRotation: number
  borderRotation: number
  borderWidth: number
  borderHeight: number
  borderOffsetX: number
  borderOffsetY: number
  frameStyle: FrameStyle
}

export interface Position {
  x: number | null
  y: number | null
}

export enum FrameStyle {
  none = 'none',
  border = 'border',
}

export enum Side {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left',
}
