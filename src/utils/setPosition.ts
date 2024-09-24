function setPosition(ref: HTMLDivElement | null, x: number | null, y: number | null) {
  if (!ref) {
    return
  }
  ref.style.transform = `translate(${x || 0}px, ${y || 0}px)`
}

export default setPosition
