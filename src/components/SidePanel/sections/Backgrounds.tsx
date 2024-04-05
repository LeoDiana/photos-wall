import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import getBackgrounds from 'api/getBackgrounds.ts'
import updateBackground from 'api/updateBackground.ts'
import useStore from 'store/useStore.ts'

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
    <div className='flex gap-2 flex-wrap overflow-scroll h-full content-start'>
      <div className='w-full pb-2'>
        <div className='flex justify-between'>
          <div className='w-9 h-9 bg-indigo-600' onClick={handleBackgroundChange('#4f46e5')} />
          <div className='w-9 h-9 bg-yellow-500' onClick={handleBackgroundChange('#eab308')} />
          <div className='w-9 h-9 bg-red-600' onClick={handleBackgroundChange('#dc2626')} />
          <div className='w-9 h-9 bg-green-500' onClick={handleBackgroundChange('#22c55e')} />
          <div className='w-9 h-9 bg-white' onClick={handleBackgroundChange('#ffffff')} />
          <div className='w-9 h-9 bg-neutral-600' onClick={handleBackgroundChange('#525252')} />
          <div className='w-9 h-9 bg-neutral-900' onClick={handleBackgroundChange('#171717')} />
          <div className='w-9 h-9 bg-black' onClick={handleBackgroundChange('#000000')} />
        </div>
      </div>
      {backgrounds.map((bg) => (
        <div
          key={bg}
          className='bg-cover w-80 h-52'
          style={{ backgroundImage: `url(${bg})` }}
          onClick={handleBackgroundChange(bg)}
        />
      ))}
    </div>
  )
}

export default Backgrounds
