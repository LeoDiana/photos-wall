import { create } from 'zustand'

import { ImageData, StickerData, StickerFromGallery } from 'types/imageData.ts'

type StoreImage = ImageData | StickerData

interface State {
  images: StoreImage[]
  setImages: (images: StoreImage[]) => void
  addImage: (image: StoreImage) => void
  updateImage: (id: string, imageData: Omit<Partial<StoreImage>, 'id'>) => void
  deleteImage: (id: string) => void
  movingImageIndex: number | null // index of image when user moves image from uploaded section
  setMovingImageIndex: (index: number | null) => void
  movingSticker: StickerFromGallery | null // data of sticker when user moves image from uploaded section
  setMovingSticker: (src: StickerFromGallery | null) => void
  selectedImageIndex: number | null
  setSelectedImageIndex: (index: number | null) => void
  selectedImageDataForEditingSection: Record<string, number> | null
  setSelectedImageDataForEditingSection: (data: Record<string, number> | null) => void
  selectedBackground: string | null
  setSelectedBackground: (src: string | null) => void
  isViewingMode: boolean
  setIsViewingMode: (isViewingMode: boolean) => void
  title: string
  setTitle: (value: string) => void
}

const useStore = create<State>()((set) => ({
  images: [],
  setImages: (images) => set(() => ({ images: images })),
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  updateImage: (id, imageData) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? ({ ...img, ...imageData } as StoreImage) : img,
      ),
    })),
  deleteImage: (id) => set((state) => ({ images: state.images.filter((img) => img.id !== id) })),
  movingImageIndex: null,
  setMovingImageIndex: (index) => set(() => ({ movingImageIndex: index })),
  movingSticker: null,
  setMovingSticker: (src) => set(() => ({ movingSticker: src })),
  selectedImageIndex: null,
  setSelectedImageIndex: (index) => set(() => ({ selectedImageIndex: index })),
  selectedImageDataForEditingSection: null,
  setSelectedImageDataForEditingSection: (data) =>
    set((state) => ({
      selectedImageDataForEditingSection: { ...state.selectedImageDataForEditingSection, ...data },
    })),
  selectedBackground: null,
  setSelectedBackground: (src) => set(() => ({ selectedBackground: src })),
  isViewingMode: false,
  setIsViewingMode: (isViewingMode) => set(() => ({ isViewingMode })),
  title: '',
  setTitle: (value) => set(() => ({ title: value })),
}))

export default useStore
