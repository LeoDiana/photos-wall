function scaleImage(
  originalWidth: number,
  originalHeight: number,
  borderWidth: number,
  borderHeight: number,
) {
  // Calculate the scale factor based on the provided dimensions
  const widthRatio = borderWidth / originalWidth
  const heightRatio = borderHeight / originalHeight
  const scaleFactor = Math.max(widthRatio, heightRatio)

  // Calculate the scaled width and height
  const scaledWidth = Math.max(originalWidth * scaleFactor, borderWidth)
  const scaledHeight = Math.max(originalHeight * scaleFactor, borderHeight)

  return {
    width: scaledWidth,
    height: scaledHeight,
  }
}

export default scaleImage
