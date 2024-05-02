import { useParams } from 'react-router-dom'

import deleteImage from 'api/deleteImage.ts'
import updateImageData from 'api/updateImageData.ts'
import useStore from 'store/useStore.ts'
import { Button } from 'styles/buttonStyles.ts'
import { FrameStyle, ImageType } from 'types/imageData.ts'
import { toDeg } from 'utils/math'

import { EditingSectionContainer, Frame, FramesContainer } from './styles.ts'

const frames: {
  variant: FrameStyle
  title: string
}[] = [
  { variant: FrameStyle.none, title: 'None' },
  { variant: FrameStyle.border, title: 'Border' },
]

function Editing() {
  const { wallId } = useParams() as {
    wallId: string
  }

  const {
    images,
    setImages,
    selectedImageIndex,
    setSelectedImageIndex,
    selectedImageDataForEditingSection,
    updateImage,
    deleteImage: deleteImageFromStore,
  } = useStore((state) => state)

  function handleChangeBorderStyle(style: FrameStyle) {
    return () => {
      if (typeof selectedImageIndex === 'number') {
        updateImageData(images[selectedImageIndex].id, wallId, { frameStyle: style })
        setImages(
          images.map((img) =>
            img.id === images[selectedImageIndex].id ? { ...img, frameStyle: style } : img,
          ),
        )
      }
    }
  }

  function handleRemove() {
    if (typeof selectedImageIndex === 'number') {
      updateImageData(images[selectedImageIndex].id, wallId, { x: null, y: null })
      updateImage(images[selectedImageIndex].id, { x: null, y: null })
    }
  }

  function handleDelete() {
    if (typeof selectedImageIndex === 'number') {
      deleteImage(images[selectedImageIndex].id, wallId)
      deleteImageFromStore(images[selectedImageIndex].id)
      setSelectedImageIndex(null)
    }
  }

  if (selectedImageIndex === undefined || selectedImageIndex === null) {
    return null
  }

  return images[selectedImageIndex].type === ImageType.image ? (
    <EditingSectionContainer>
      <div>
        <div>Outer Rotation: {toDeg(selectedImageDataForEditingSection?.borderRotation || 0)}°</div>
        <div>Image rotation: {toDeg(selectedImageDataForEditingSection?.imageRotation || 0)}°</div>
      </div>
      <div>Border</div>
      <FramesContainer>
        {frames.map(({ variant, title }) => (
          <div key={variant} onClick={handleChangeBorderStyle(variant)}>
            <Frame $variant={variant} $imgSrc={images[selectedImageIndex].src} />
            {title}
          </div>
        ))}
      </FramesContainer>
      <Button onClick={handleRemove}>Remove from wall</Button>
    </EditingSectionContainer>
  ) : (
    <EditingSectionContainer>
      <div>
        <div>Rotation: {toDeg(selectedImageDataForEditingSection?.borderRotation || 0)}°</div>
      </div>
      <Button onClick={handleDelete}>Delete sticker</Button>
    </EditingSectionContainer>
  )
}

export default Editing
