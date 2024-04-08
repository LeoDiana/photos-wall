import { useParams } from 'react-router-dom'

import updateImageData from 'api/updateImageData.ts'
import useStore from 'store/useStore.ts'
import { Button } from 'styles/buttonStyles.ts'
import { FrameStyle } from 'types/imageData.ts'
import { toDeg } from 'utils/math'

import { Frame, FramesContainer } from './styles.ts'

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

  const images = useStore((state) => state.images)
  const setImages = useStore((state) => state.setImages)
  const selectedImageIndex = useStore((state) => state.selectedImageIndex)
  const selectedImageDataForEditingSection = useStore(
    (state) => state.selectedImageDataForEditingSection,
  )

  const imgSrc = Number.isInteger(selectedImageIndex) ? images[selectedImageIndex!].src : null

  function handleChangeBorderStyle(style: FrameStyle) {
    return () => {
      if (selectedImageIndex) {
        updateImageData(images[selectedImageIndex].id, wallId, { frameStyle: style })
        setImages(
          images.map((img) =>
            img.id === images[selectedImageIndex].id ? { ...img, frameStyle: style } : img,
          ),
        )
      }
    }
  }

  return Number.isInteger(selectedImageIndex) ? (
    <>
      <div>rotation</div>
      <div>{toDeg(selectedImageDataForEditingSection?.borderRotation || 0) || ':('}</div>
      <div>image rotation</div>
      <div>{toDeg(selectedImageDataForEditingSection?.imageRotation || 0) || ':('}</div>
      <div>border</div>
      <FramesContainer>
        {frames.map(({ variant, title }) => (
          <div key={variant} onClick={handleChangeBorderStyle(variant)}>
            <Frame $variant={variant} $imgSrc={imgSrc} />
            {title}
          </div>
        ))}
      </FramesContainer>
      <Button>Remove from wall</Button>
    </>
  ) : null
}

export default Editing
