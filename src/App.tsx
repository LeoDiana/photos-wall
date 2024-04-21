import { MouseEvent, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import Wall from 'components/Wall/Wall.tsx'

import { getImages, updateImageData } from './api'
import addSticker from './api/addSticker.ts'
import deleteImage from './api/deleteImage.ts'
import SidePanel from './components/SidePanel'
import useStore from './store/useStore.ts'
import { MainContainer, ReturnToEditModeButton, Title, WallContainer } from './styles.ts'

function App() {
  const { wallId } = useParams() as {
    wallId: string
  }

  const images = useStore((state) => state.images)
  const setImages = useStore((state) => state.setImages)
  const updateImage = useStore((state) => state.updateImage)
  const deleteImageFromStore = useStore((state) => state.deleteImage)
  const addImageToStore = useStore((state) => state.addImage)

  const movingSticker = useStore((state) => state.movingSticker)
  const setMovingSticker = useStore((state) => state.setMovingSticker)
  const movingImageIndex = useStore((state) => state.movingImageIndex)
  const setMovingImageIndex = useStore((state) => state.setMovingImageIndex)

  const isViewingMode = useStore((state) => state.isViewingMode)
  const setIsViewingMode = useStore((state) => state.setIsViewingMode)

  const wallContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wallContainerRef.current) {
      const centerWidth =
        (wallContainerRef.current.scrollWidth - wallContainerRef.current.offsetWidth) / 2
      const centerHeight =
        (wallContainerRef.current.scrollHeight - wallContainerRef.current.offsetHeight) / 2
      wallContainerRef.current.scrollLeft = centerWidth
      wallContainerRef.current.scrollTop = centerHeight
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      setImages(await getImages(wallId))
    })()
  }, [setImages, wallId])

  function handleImagePositionChange(id: string, x: number | null, y: number | null) {
    updateImageData(id, wallId, { x, y })
    updateImage(id, { x, y, order: Date.now() })
  }

  function bringToFront(id: string) {
    setImages(images.map((img) => (img.id === id ? { ...img, order: Date.now() } : img)))
  }

  async function handleMoveImageToWall(event: MouseEvent<HTMLDivElement>) {
    const wall = (event.target as HTMLDivElement).getBoundingClientRect()
    const mouseX = event.clientX - wall.x
    const mouseY = event.clientY - wall.y
    const { x, y } = {
      x: mouseX,
      y: mouseY,
    }

    if (movingImageIndex !== null) {
      handleImagePositionChange(images[movingImageIndex].id, x, y)
      setMovingImageIndex(null)
    }

    if (movingSticker !== null) {
      const photo = await addSticker(wallId, movingSticker)
      addImageToStore(photo)
      handleImagePositionChange(photo.id, x, y)
      setMovingSticker(null)
    }
  }

  function handleRemoveFromWall(id: string) {
    handleImagePositionChange(id, null, null)
  }

  function handleDeleteImage(id: string) {
    deleteImage(id, wallId)
    deleteImageFromStore(id)
  }

  return (
    <MainContainer>
      <Title>My wall</Title>
      {isViewingMode ? (
        <ReturnToEditModeButton onClick={() => setIsViewingMode(false)}>
          &#10132; Edit mode
        </ReturnToEditModeButton>
      ) : (
        <SidePanel />
      )}
      <WallContainer ref={wallContainerRef}>
        <Wall
          images={images}
          onImagePositionChange={handleImagePositionChange}
          bringToFront={bringToFront}
          onMouseUp={handleMoveImageToWall}
          handleRemoveFromWall={handleRemoveFromWall}
        />
      </WallContainer>
    </MainContainer>
  )
}

export default App
