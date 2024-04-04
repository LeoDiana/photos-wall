export const DEFAULT_IMAGE_HEIGHT = 250
export const DEFAULT_IMAGE_WIDTH = 250
export const EDGES: Array<{
  from: 'A' | 'B' | 'C' | 'D'
  to: 'A' | 'B' | 'C' | 'D'
  xOffsetMultiplier: number
  yOffsetMultiplier: number
}> = [
  { from: 'D', to: 'A', xOffsetMultiplier: 1, yOffsetMultiplier: 0 },
  { from: 'A', to: 'B', xOffsetMultiplier: 0, yOffsetMultiplier: 1 },
  { from: 'B', to: 'C', xOffsetMultiplier: -1, yOffsetMultiplier: 0 },
  { from: 'C', to: 'D', xOffsetMultiplier: 0, yOffsetMultiplier: -1 },
]
export const MAX_BORDER_HEIGHT = 1000
export const MAX_BORDER_WIDTH = 1000
export const MAX_SCALE = 5

export const MAX_ZOOM = 2
export const MIN_BORDER_HEIGHT = 50

export const MIN_BORDER_WIDTH = 50
export const MIN_ZOOM = 0.5
export const WALL_HEIGHT = 1000
export const WALL_WIDTH = 3000
export const ZOOM_FACTOR = 0.1
