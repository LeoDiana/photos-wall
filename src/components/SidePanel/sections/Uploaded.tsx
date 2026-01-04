import { ChangeEvent, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { addImage } from 'api'
import UploadWrapper from 'components/UploadWrapper'
import useUpload from 'hooks/useUpload.ts'
import useStore from 'store/useStore.ts'
import { Button } from 'styles/buttonStyles.ts'
import { ImageData, ImageType } from 'types/imageData.ts'

import { ErrorMessage, Loader, UploadedImage, UploadedImagesContainer } from './styles.ts'

function isImageWithoutCoords(imageData: ImageData | import('types/imageData.ts').StickerData) {
  return imageData.x === null && imageData.y === null
}

function Uploaded() {
  const { wallId } = useParams() as {
    wallId: string
  }
  const { handleChange, urls, clear, errorMessage } = useUpload()

  const images = useStore((state) => state.images)
  const addImageToStore = useStore((state) => state.addImage)
  const setMovingImageIndex = useStore((state) => state.setMovingImageIndex)

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    handleChange(event)
  }

  useEffect(() => {
    ;(async () => {
      let index = 0
      for (const url of urls) {
        if (url !== 'loading' && url !== 'added') {
          const photo = await addImage(url, wallId)
          addImageToStore(photo)
          urls[index] = 'added'
        }
        index++
      }
      if (urls.length > 0 && urls.every((url) => url !== 'loading')) {
        clear()
      }
    })()
  }, [urls, wallId])

  return (
    <>
      <UploadWrapper onChange={handleUpload} multiple>
        <Button>Upload</Button>
      </UploadWrapper>
      {urls.some((url) => url === 'loading') && <Loader>LOADING...</Loader>}
      {Boolean(errorMessage) && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <UploadedImagesContainer>
        {images.map(
          (image, index) =>
            isImageWithoutCoords(image) &&
            image.type === ImageType.image && (
              <UploadedImage
                key={image.id}
                $imgSrc={image.src}
                draggable
                onDragEnd={() => setMovingImageIndex(index)}
              />
            ),
        )}
      </UploadedImagesContainer>
    </>
  )
}

export default Uploaded
