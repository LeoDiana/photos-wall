import { MouseEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ResizeHelperProps {
  onScaling: (diff: number) => void
  onScalingFinished: () => void
}

function ResizeHelper({ onScaling, onScalingFinished }: ResizeHelperProps) {
  const [isResizing, setIsResizing] = useState(false)
  const offset = useRef({ x: 0, y: 0 })

  function handleMouseDownResize(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
    setIsResizing(true)
    offset.current = {
      x: event.clientX,
      y: event.clientY,
    }
  }

  function handleMouseMoveResize(event: MouseEvent<HTMLDivElement>) {
    const difX = event.clientX - offset.current.x
    onScaling(difX)
  }

  function handleMouseUpResize() {
    setIsResizing(false)
    onScalingFinished()
  }

  return (
    <>
      <div
        className='z-[9999] cursor-nesw-resize absolute -top-1 -right-1 w-6 h-6'
        onMouseDown={handleMouseDownResize}
      />
      <div
        className='z-[9999] cursor-nwse-resize absolute -top-1 -left-1 w-6 h-6'
        onMouseDown={handleMouseDownResize}
      />
      <div
        className='z-[9999] cursor-nwse-resize absolute -bottom-1 -right-1 w-6 h-6'
        onMouseDown={handleMouseDownResize}
      />
      <div
        className='z-[9999] cursor-nesw-resize absolute -bottom-1 -left-1 w-6 h-6'
        onMouseDown={handleMouseDownResize}
      />
      {isResizing &&
        createPortal(
          <div
            onMouseUp={handleMouseUpResize}
            onMouseMove={handleMouseMoveResize}
            className={'fixed opacity-40 top-0 left-0 w-screen h-screen z-[99999]'}
          />,
          document.getElementById('overlay')!,
        )}
    </>
  )
}

export default ResizeHelper
