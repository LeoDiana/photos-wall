import { useState } from 'react'

import { ImageIcon, SettingsIcon, SlidersIcon, StickerIcon, PhotosIcon } from 'assets'

import { Uploaded } from './sections'

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

  function renderSection() {
    switch (selectedSection) {
      case Sections.uploaded:
        return <Uploaded />
      default:
        return <></>
    }
  }

  return (
    <div
      className={`bg-neutral-800 h-screen fixed left-0 top-0 z-10 flex flex-row ${isExpanded ? 'w-[430px]' : 'w-20'}`}
    >
      <div
        className='bg-neutral-800 absolute right-0 translate-x-1/2 h-14 w-6 top-1/2 -translate-y-1/2 rounded-xl flex items-center p-1 justify-end select-none -z-10'
        onClick={() => setIsExpanded((isExpanded) => !isExpanded)}
      >
        <p>{isExpanded ? '<' : '>'}</p>
      </div>
      <div className='bg-neutral-900 w-20 h-screen'>
        {sections.map(({ id, title, icon: Icon }) => (
          <div
            key={id}
            className={`w-20 h-20 text-xs flex flex-col items-center justify-center ${selectedSection === id && isExpanded && 'bg-neutral-800'}`}
            onClick={() => {
              setSelectedSection(id)
              setIsExpanded(true)
            }}
          >
            <div className='w-[40px] h-[40px]'>
              <Icon />
            </div>
            {title}
          </div>
        ))}
      </div>
      {isExpanded && <div className='grow p-4'>{renderSection()}</div>}
    </div>
  )
}

export default SidePanel
