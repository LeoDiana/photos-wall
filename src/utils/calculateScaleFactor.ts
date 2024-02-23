function calculateScaleFactor(
  originalWidth: number,
  originalHeight: number,
  borderWidth: number,
  borderHeight: number,
) {
  const widthRatio = borderWidth / originalWidth
  const heightRatio = borderHeight / originalHeight

  return Math.max(widthRatio, heightRatio)
}

export default calculateScaleFactor
