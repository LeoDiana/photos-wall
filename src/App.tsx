import { MouseEvent, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import Wall from 'components/Wall/Wall.tsx'

import { getImages, updateImageData } from './api'
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
  const deleteImageFromStore = useStore((state) => state.deleteImage)

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
    setImages(images.map((img) => (img.id === id ? { ...img, x, y, order: Date.now() } : img)))
  }

  function bringToFront(id: string) {
    setImages(images.map((img) => (img.id === id ? { ...img, order: Date.now() } : img)))
  }

  function handleMoveImageToWall(event: MouseEvent<HTMLDivElement>) {
    if (movingImageIndex !== null) {
      const wall = (event.target as HTMLDivElement).getBoundingClientRect()
      const selectedImageId = images[movingImageIndex].id
      const mouseX = event.clientX - wall.x
      const mouseY = event.clientY - wall.y

      const { x, y } = {
        x: mouseX,
        y: mouseY,
      }
      handleImagePositionChange(selectedImageId, x, y)
      setMovingImageIndex(null)
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
          handleDeleteImage={handleDeleteImage}
        />
      </WallContainer>
    </MainContainer>
  )
}

export default App
