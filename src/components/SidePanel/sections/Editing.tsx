import { useParams } from 'react-router-dom'

import updateImageData from 'api/updateImageData.ts'
import useStore from 'store/useStore.ts'
import { FrameStyles } from 'types/imageData.ts'
import { toDeg } from 'utils/math'

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

  function handleChangeBorderStyle(style: FrameStyles) {
    if (selectedImageIndex) {
      updateImageData(images[selectedImageIndex].id, wallId, { frameStyle: style })
      setImages(
        images.map((img) =>
          img.id === images[selectedImageIndex].id ? { ...img, frameStyle: style } : img,
        ),
      )
    }
  }

  return Number.isInteger(selectedImageIndex) ? (
    <>
      <div>rotation</div>
      <div>{toDeg(selectedImageDataForEditingSection?.borderRotation || 0) || ':('}</div>
      <div>image rotation</div>
      <div>{toDeg(selectedImageDataForEditingSection?.imageRotation || 0) || ':('}</div>
      <div>border</div>
      <div className='flex gap-2'>
        <div onClick={() => handleChangeBorderStyle(FrameStyles.none)}>
          <div className='w-20 h-20 bg-cover' style={{ backgroundImage: `url(${imgSrc})` }}></div>
          None
        </div>
        <div onClick={() => handleChangeBorderStyle(FrameStyles.border)}>
          <div
            className='w-20 h-20 bg-cover border-4 border-white'
            style={{ backgroundImage: `url(${imgSrc})` }}
          ></div>
          Border
        </div>
      </div>
      <div className='rounded-lg px-4 py-2 border-2 border-indigo-800 font-medium w-full bg-indigo-500 flex justify-center'>
        Remove from wall
      </div>
    </>
  ) : null
}

export default Editing
