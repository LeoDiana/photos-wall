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
  type: ImageType.image
}

export interface Position {
  x: number | null
  y: number | null
}

export type StickerData = Pick<
  ImageData,
  | 'id'
  | 'src'
  | 'x'
  | 'y'
  | 'originalHeight'
  | 'originalWidth'
  | 'order'
  | 'scale'
  | 'imageRotation'
> & { type: ImageType.sticker }

export interface StickerFromGallery extends Dimensions {
  id: string
  src: string
  scale: number
}

export enum FrameStyle {
  none = 'none',
  border = 'border',
}

export enum ImageType {
  image = 'image',
  sticker = 'sticker',
}

export enum Side {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left',
}
