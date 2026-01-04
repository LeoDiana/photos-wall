// Backgrounds are no longer stored in Firebase, return empty array
async function getBackgrounds(): Promise<string[]> {
  return []
}

export default getBackgrounds
