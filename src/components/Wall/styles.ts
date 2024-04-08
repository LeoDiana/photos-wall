import { css } from 'styled-components'
import tw, { styled } from 'twin.macro' // eslint-disable-line import/named

import { WALL_HEIGHT, WALL_WIDTH } from 'consts'
import { withBackground } from 'styles/utilStyles.ts'

export const WallElement = styled.div<{
  $bg: string | null
}>(({ $bg }) => [
  tw`bg-teal-50 absolute overflow-hidden origin-top-left bg-cover`,
  withBackground({ imgSrc: $bg }),
  $bg?.startsWith('#') &&
    css`
      background-color: ${$bg};
    `,
  css`
    width: ${WALL_WIDTH}px;
    height: ${WALL_HEIGHT}px;
  `,
])

export const ZoomBackdrop = tw.div`absolute w-full h-full blur-xl bg-black opacity-40`
export const ZoomContainer = tw.div`fixed right-2 top-1/2 z-[99999] flex flex-col gap-2`
export const ZoomIcon = tw.div`w-6 h-6 drop-shadow`
