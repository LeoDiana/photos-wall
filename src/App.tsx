import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import Wall from 'components/Wall/Wall.tsx'

import { getImages } from './api'
import getTitle from './api/getTitle.ts'
import SidePanel from './components/SidePanel'
import useStore from './store/useStore.ts'
import { MainContainer, ReturnToEditModeButton, Title, WallContainer } from './styles.ts'

function App() {
  const { wallId } = useParams() as {
    wallId: string
  }

  const { setImages, isViewingMode, setIsViewingMode, title, setTitle } = useStore((state) => state)

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
      setTitle(await getTitle(wallId))
    })()
  }, [wallId])

  useEffect(() => {
    ;(async () => {
      setImages(await getImages(wallId))
    })()
  }, [setImages, wallId])

  return (
    <MainContainer>
      {title && <Title>{title}</Title>}
      {isViewingMode ? (
        <ReturnToEditModeButton onClick={() => setIsViewingMode(false)}>
          &#10132; Edit mode
        </ReturnToEditModeButton>
      ) : (
        <SidePanel />
      )}
      <WallContainer ref={wallContainerRef}>
        <Wall />
      </WallContainer>
    </MainContainer>
  )
}

export default App
