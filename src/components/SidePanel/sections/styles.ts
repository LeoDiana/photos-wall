import tw, { styled, css } from 'twin.macro' // eslint-disable-line import/named

import { withBackground } from 'styles/utilStyles.ts'
import { FrameStyle } from 'types/imageData.ts'

const frameStyles = {
  [FrameStyle.none]: tw``,
  [FrameStyle.border]: tw`border-4 border-white`,
}

export const BackgroundSectionContainer = tw.div`flex gap-2 flex-wrap overflow-scroll h-full content-start`
export const ColorBackground = styled.div<{
  $color: string | null
}>(({ $color }) => [
  tw`w-9 h-9`,
  css`
    background-color: ${$color};
  `,
])

export const ColorBackgroundsContainer = tw.div`w-full pb-2 flex justify-between`
export const ErrorMessage = tw.div`font-medium text-center mt-2 text-red-400`

export const Frame = styled.div<{
  $imgSrc: string | null
  $variant: FrameStyle
}>(({ $imgSrc, $variant }) => [
  tw`w-20 h-20 bg-cover`,
  frameStyles[$variant],
  withBackground({ imgSrc: $imgSrc }),
])
export const FramesContainer = tw.div`flex gap-2`

export const ImageBackground = styled.div<{
  $imgSrc: string | null
}>(({ $imgSrc }) => [tw`bg-cover w-80 h-52`, withBackground({ imgSrc: $imgSrc })])
export const Loader = tw.div`font-medium text-center mt-2`

export const StickerElement = styled.div<{
  $imgSrc: string | null
  $width: number
  $height: number
}>(({ $imgSrc, $width, $height }) => [
  tw`bg-cover`,
  withBackground({ imgSrc: $imgSrc }),
  css`
    width: ${$width}px;
    height: ${$height}px;
  `,
])

export const UploadedImage = styled.div<{
  $imgSrc: string | null
}>(({ $imgSrc }) => [tw`h-[100px] w-[100px] bg-cover`, withBackground({ imgSrc: $imgSrc })])

export const UploadedImagesContainer = tw.div`flex gap-2 flex-wrap mt-4`
