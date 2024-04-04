import { create } from 'zustand'

import { ImageData } from 'types/imageData.ts'

interface State {
  images: ImageData[]
  setImages: (images: ImageData[]) => void
  deleteImage: (id: string) => void
  selectedImageIndex: number | null
  setSelectedImageIndex: (index: number | null) => void
}

const useStore = create<State>()((set) => ({
  images: [],
  setImages: (images) => set(() => ({ images: images })),
  deleteImage: (id) => set((state) => ({ images: state.images.filter((img) => img.id !== id) })),
  selectedImageIndex: null,
  setSelectedImageIndex: (index) => set(() => ({ selectedImageIndex: index })),
}))

export default useStore
