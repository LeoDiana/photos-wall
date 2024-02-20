import { ForwardedRef, forwardRef } from 'react'

interface ImageProps {
  src: string
  order: number
  onSelect: () => void
  onRemoveFromWall: () => void
}

function Image(
  { src, onSelect, onRemoveFromWall, order = 0 }: ImageProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={`absolute select-none flex`} ref={ref}>
      <div
        className={`w-[250px] h-[250px] cursor-move`}
        style={{ zIndex: order }}
        onMouseDownCapture={() => onSelect()}
      >
        <img src={src} draggable={false} />
      </div>
      <div className='text-pink-600 text-2xl z-[9999]'>
        <div>x</div>
        <div onClick={onRemoveFromWall}>!</div>
      </div>
    </div>
  )
}

export default forwardRef(Image)
