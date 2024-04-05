import { create } from 'zustand'

import { ImageData } from 'types/imageData.ts'

interface State {
  images: ImageData[]
  setImages: (images: ImageData[]) => void
  deleteImage: (id: string) => void
  movingImageIndex: number | null // index of image when user moves image from uploaded section
  setMovingImageIndex: (index: number | null) => void
  selectedImageIndex: number | null
  setSelectedImageIndex: (index: number | null) => void
  selectedImageDataForEditingSection: Record<string, number> | null
  setSelectedImageDataForEditingSection: (data: Record<string, number> | null) => void
  selectedBackground: string | null
  setSelectedBackground: (src: string | null) => void
}

const useStore = create<State>()((set) => ({
  images: [],
  setImages: (images) => set(() => ({ images: images })),
  deleteImage: (id) => set((state) => ({ images: state.images.filter((img) => img.id !== id) })),
  movingImageIndex: null,
  setMovingImageIndex: (index) => set(() => ({ movingImageIndex: index })),
  selectedImageIndex: null,
  setSelectedImageIndex: (index) => set(() => ({ selectedImageIndex: index })),
  selectedImageDataForEditingSection: null,
  setSelectedImageDataForEditingSection: (data) =>
    set((state) => ({
      selectedImageDataForEditingSection: { ...state.selectedImageDataForEditingSection, ...data },
    })),
  selectedBackground: null,
  setSelectedBackground: (src) => set(() => ({ selectedBackground: src })),
}))

export default useStore
