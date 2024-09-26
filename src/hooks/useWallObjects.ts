import { ImageData, StickerData } from '../types/imageData.ts'

interface ImageValueState {
  _val: number
  images: (ImageData | StickerData)[]
}

interface ImageValueStore {
  wallId?: string
  state: ImageValueState
}

let _state: ImageValueStore

function useWallObjects(wallId: string) {
  if (!_state || _state.wallId !== wallId) {
    // refetch
    _state = { wallId, state: { _val: 0, images: [] } }
  }

  return _state.state
}

export default useWallObjects
