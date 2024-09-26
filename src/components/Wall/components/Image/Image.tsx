import { ForwardedRef, forwardRef } from 'react'

import { ImageData } from 'types/imageData.ts'

import ResizeHelper from '../ResizeHelper/ResizeHelper.tsx'
import RotateTool from '../RotateTool/RotateTool.tsx'

import {
  BorderContainer,
  ImageContainer,
  ImageElement,
  ImageInsideBorder,
  ImageInsideBorderContainer,
  InnerImageContainer,
  StyledBorder,
} from './styles.ts'
import useImage from './useImage.ts'

interface ImageProps extends ImageData {
  isSelected: boolean
  onSelect: () => void
  containerRef: HTMLDivElement
}

function Image(props: ImageProps, ref: ForwardedRef<HTMLDivElement>) {
  const { src, onSelect, isSelected = false, order = 0, frameStyle } = props

  const {
    isEditingMode,
    toggleEditingMode,
    handleBorderResize,
    handleBorderResizeFinished,
    handleBorderRotating,
    handleBorderRotatingFinished,
    handleScaling,
    handleScalingFinished,
    handleRotating,
    handleRotatingFinished,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    borderCenter,
    imageCenter,
    borderRef,
    imageInBorderRef,
    imageRef,
    styledBorderRef,
  } = useImage(props)

  return (
    <ImageContainer ref={ref}>
      <BorderContainer
        ref={borderRef}
        $order={order}
        onMouseDownCapture={onSelect}
        onDoubleClick={toggleEditingMode}
      >
        {isSelected && (
          <ResizeHelper
            onScaling={handleBorderResize}
            onScalingFinished={handleBorderResizeFinished}
            variant='border'
          />
        )}
        {isEditingMode && (
          <RotateTool
            onRotating={handleBorderRotating}
            onRotatingFinished={handleBorderRotatingFinished}
            center={borderCenter}
          />
        )}
        <InnerImageContainer $isEditingMode={isEditingMode}>
          <ImageInsideBorderContainer>
            <ImageInsideBorder ref={imageInBorderRef} $imgSrc={src} />
          </ImageInsideBorderContainer>
          <ImageElement
            ref={imageRef}
            $imgSrc={src}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {isEditingMode && (
              <ResizeHelper
                onScaling={handleScaling}
                onScalingFinished={handleScalingFinished}
                variant='image'
              />
            )}
            {isEditingMode && (
              <RotateTool
                onRotating={handleRotating}
                onRotatingFinished={handleRotatingFinished}
                center={imageCenter}
              />
            )}
          </ImageElement>
        </InnerImageContainer>
        <StyledBorder ref={styledBorderRef} $order={order} $variant={frameStyle} />
      </BorderContainer>
    </ImageContainer>
  )
}

export default forwardRef(Image)
