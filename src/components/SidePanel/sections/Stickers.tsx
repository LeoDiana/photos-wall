import { useEffect, useState } from 'react'

import getStickers from '../../../api/getStickers.ts'
import useStore from '../../../store/useStore.ts'
import { StickerFromGallery } from '../../../types/imageData.ts'

import { BackgroundSectionContainer, StickerElement } from './styles.ts'

function Stickers() {
  const [stickers, setStickers] = useState<StickerFromGallery[]>([])
  const setMovingSticker = useStore((state) => state.setMovingSticker)

  useEffect(() => {
    ;(async () => {
      setStickers(await getStickers())
    })()
  }, [])

  return (
    <BackgroundSectionContainer>
      {stickers.map((sticker) => (
        <StickerElement
          key={sticker.id}
          $imgSrc={sticker.src}
          $width={sticker.width * sticker.scale}
          $height={sticker.height * sticker.scale}
          draggable
          onDragEnd={() => setMovingSticker(sticker)}
        />
      ))}
    </BackgroundSectionContainer>
  )
}

export default Stickers
