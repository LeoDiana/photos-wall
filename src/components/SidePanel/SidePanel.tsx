import { useEffect, useState } from 'react'

import { ImageIcon, SettingsIcon, SlidersIcon, StickerIcon, PhotosIcon } from 'assets'
import useStore from 'store/useStore.ts'

import { Uploaded, Editing, Backgrounds, Stickers } from './sections'
import General from './sections/General.tsx'
import {
  Container,
  ExpandButton,
  IconContainer,
  SectionButton,
  SectionButtonsContainer,
  SectionContainer,
} from './styles.ts'

enum Sections {
  uploaded = 'photos',
  stickers = 'stickers',
  backgrounds = 'backgrounds',
  general = 'general',
  editing = 'editing',
}

const sections = [
  {
    id: Sections.general,
    icon: SettingsIcon,
    title: 'General',
  },
  {
    id: Sections.uploaded,
    icon: PhotosIcon,
    title: 'Photos',
  },
  {
    id: Sections.stickers,
    icon: StickerIcon,
    title: 'Stickers',
  },
  {
    id: Sections.backgrounds,
    icon: ImageIcon,
    title: 'Backgrounds',
  },
  {
    id: Sections.editing,
    icon: SlidersIcon,
    title: 'Editing',
  },
] as const

function SidePanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedSection, setSelectedSection] = useState(Sections.uploaded)
  const selectedImageIndex = useStore((state) => state.selectedImageIndex)

  useEffect(() => {
    if (Number.isInteger(selectedImageIndex)) {
      setSelectedSection(Sections.editing)
    }
  }, [selectedImageIndex])

  function toggleExpanded() {
    setIsExpanded((isExpanded) => !isExpanded)
  }

  function renderSection() {
    switch (selectedSection) {
      case Sections.general:
        return <General />
      case Sections.uploaded:
        return <Uploaded />
      case Sections.editing:
        return <Editing />
      case Sections.backgrounds:
        return <Backgrounds />
      case Sections.stickers:
        return <Stickers />
      default:
        return <General />
    }
  }

  return (
    <Container $isExpanded={isExpanded}>
      <ExpandButton onClick={toggleExpanded}>
        <p>{isExpanded ? '<' : '>'}</p>
      </ExpandButton>
      <SectionButtonsContainer>
        {sections.map(({ id, title, icon: Icon }) => (
          <SectionButton
            key={id}
            $shouldBeHighlighted={selectedSection === id && isExpanded}
            onClick={() => {
              setSelectedSection(id)
              setIsExpanded(true)
            }}
          >
            <IconContainer>
              <Icon />
            </IconContainer>
            {title}
          </SectionButton>
        ))}
      </SectionButtonsContainer>
      {isExpanded && <SectionContainer>{renderSection()}</SectionContainer>}
    </Container>
  )
}

export default SidePanel
