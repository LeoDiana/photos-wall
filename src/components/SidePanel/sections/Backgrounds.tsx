import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import getBackgrounds from 'api/getBackgrounds.ts'
import updateBackground from 'api/updateBackground.ts'
import useStore from 'store/useStore.ts'

import {
  BackgroundSectionContainer,
  ColorBackground,
  ColorBackgroundsContainer,
  ImageBackground,
} from './styles.ts'

const backgroundColors = [
  '#4f46e5',
  '#eab308',
  '#dc2626',
  '#22c55e',
  '#ffffff',
  '#525252',
  '#171717',
  '#000000',
]

function Backgrounds() {
  const { wallId } = useParams() as {
    wallId: string
  }
  const setSelectedBackground = useStore((state) => state.setSelectedBackground)

  const [backgrounds, setBackgrounds] = useState<string[]>([])

  useEffect(() => {
    ;(async () => {
      setBackgrounds(await getBackgrounds())
    })()
  }, [])

  function handleBackgroundChange(value: string) {
    return () => {
      updateBackground(wallId, value)
      setSelectedBackground(value)
    }
  }

  return (
    <BackgroundSectionContainer>
      <ColorBackgroundsContainer>
        {backgroundColors.map((color) => (
          <ColorBackground key={color} $color={color} onClick={handleBackgroundChange(color)} />
        ))}
      </ColorBackgroundsContainer>
      {backgrounds.map((bg) => (
        <ImageBackground key={bg} $imgSrc={bg} onClick={handleBackgroundChange(bg)} />
      ))}
    </BackgroundSectionContainer>
  )
}

export default Backgrounds
