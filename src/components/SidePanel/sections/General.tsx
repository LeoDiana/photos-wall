import { ChangeEvent, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import getTitle from 'api/getTitle.ts'
import updateTitle from 'api/updateTitle.ts'
import useStore from 'store/useStore.ts'
import { Button } from 'styles/buttonStyles.ts'

import { GeneralSectionContainer, TitleContainer, WallInput, WallTitle } from './styles.ts'

function General() {
  const { wallId } = useParams() as {
    wallId: string
  }

  const title = useStore((state) => state.title)
  const setTitle = useStore((state) => state.setTitle)

  useEffect(() => {
    ;(async () => {
      setTitle(await getTitle(wallId))
    })()
  }, [])

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    updateTitle(wallId, event.target.value)
    setTitle(event.target.value)
  }

  const setIsViewingMode = useStore((state) => state.setIsViewingMode)

  return (
    <GeneralSectionContainer>
      <Button onClick={() => setIsViewingMode(true)}>Go to viewing mode</Button>
      <TitleContainer>
        <WallTitle>Wall title:</WallTitle>
        <WallInput value={title} onChange={handleTitleChange} />
      </TitleContainer>
    </GeneralSectionContainer>
  )
}

export default General
