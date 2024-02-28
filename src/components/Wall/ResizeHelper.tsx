import { MouseEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const styles = {
  border: 'bg-purple-400',
  image: 'bg-yellow-400',
}

interface ResizeHelperProps {
  onScaling: (diffX: number, diffY: number) => void
  onScalingFinished: () => void
  variant: 'border' | 'image'
}

function ResizeHelper({ onScaling, onScalingFinished, variant }: ResizeHelperProps) {
  const [isResizing, setIsResizing] = useState(false)
  const offset = useRef({ x: 0, y: 0 })
  const movingSides = useRef<string[]>([])

  function handleMouseDownResize(sides: string[]) {
    return (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      setIsResizing(true)
      offset.current = {
        x: event.clientX,
        y: event.clientY,
      }
      movingSides.current = sides
    }
  }

  function handleMouseMoveResize(event: MouseEvent<HTMLDivElement>) {
    const difX = event.clientX - offset.current.x
    const difY = event.clientY - offset.current.y

    onScaling(difX, difY)
  }

  function handleMouseUpResize() {
    setIsResizing(false)
    onScalingFinished()
  }

  return (
    <>
      {/* <div */}
      {/*   className={`z-[99999] absolute rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 ${styles[variant]}`} */}
      {/*   onMouseDown={handleMouseDownResize(['n', 'e'])} */}
      {/* /> */}
      {/* <div */}
      {/*   className='z-[99999] absolute rounded-full bg-purple-400 top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3' */}
      {/*   onMouseDown={handleMouseDownResize(['n', 'w'])} */}
      {/* /> */}
      <div
        className={`z-[99999] absolute rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize(['s', 'e'])}
      />
      {/* <div */}
      {/*   className='z-[99999] absolute rounded-full bg-purple-400 bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3' */}
      {/*   onMouseDown={handleMouseDownResize(['s', 'w'])} */}
      {/* /> */}
      {isResizing &&
        createPortal(
          <div
            onMouseUp={handleMouseUpResize}
            onMouseMove={handleMouseMoveResize}
            className={'fixed opacity-40 top-0 left-0 w-screen h-screen z-[999999]'}
          />,
          document.getElementById('overlay')!,
        )}
    </>
  )
}

export default ResizeHelper
