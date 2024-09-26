function setRotation(ref: HTMLDivElement | null, angle: number) {
  if (!ref) {
    return
  }
  ref.style.rotate = `${angle}rad`
}

export default setRotation
