function toDeg(angle: number) {
  return (((angle * 180) / Math.PI) % 360).toFixed(0)
}

export default toDeg
