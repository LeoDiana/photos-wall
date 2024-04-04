import { useState } from 'react'

import imageIcon from 'assets/image-icon.svg'

import { Uploaded } from './sections'

enum Sections {
  uploaded = 'photos',
  stickers = 'stickers',
  backgrounds = 'backgrounds',
}

function SidePanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedSection, setSelectedSection] = useState(Sections.uploaded)

  function renderSection() {
    switch (selectedSection) {
      case Sections.uploaded:
        return <Uploaded />
      default:
        return <div></div>
    }
  }

  return (
    <div className='bg-neutral-800 w-[430px] h-screen fixed left-0 top-0 z-10 flex flex-row'>
      <div className='bg-neutral-900 w-20 h-screen'>
        <div
          className={`w-20 h-20 text-xs flex flex-col items-center justify-center ${selectedSection === Sections.uploaded && 'bg-neutral-800'}`}
          onClick={() => setSelectedSection(Sections.uploaded)}
        >
          <img src={imageIcon} className='w-[40px] h-[40px]' />
          Photos
        </div>
        <div
          className={`w-20 h-20 text-xs flex flex-col items-center justify-center ${selectedSection === Sections.stickers && 'bg-neutral-800'}`}
          onClick={() => setSelectedSection(Sections.stickers)}
        >
          <img src={imageIcon} className='w-[40px] h-[40px]' />
          Stickers
        </div>
        <div
          className={`w-20 h-20 text-xs flex flex-col items-center justify-center ${selectedSection === Sections.backgrounds && 'bg-neutral-800'}`}
          onClick={() => setSelectedSection(Sections.backgrounds)}
        >
          <img src={imageIcon} className='w-[40px] h-[40px]' />
          Backgrounds
        </div>
      </div>
      <div className='grow p-4'>{renderSection()}</div>
    </div>
  )
}

export default SidePanel
