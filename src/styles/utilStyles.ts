import { css } from 'styled-components'

export const withBackground = ({ imgSrc }: { imgSrc: string | null }) => css`
  background-image: url(${imgSrc});
`
