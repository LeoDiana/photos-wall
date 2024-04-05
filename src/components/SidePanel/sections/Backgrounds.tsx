import useStore from 'store/useStore.ts'

const backgrounds = [
  'https://firebasestorage.googleapis.com/v0/b/fir-uploading-project.appspot.com/o/backgrounds%2Fpexels-eberhard-grossgasteiger-443446.jpg?alt=media&token=3fffa58d-2d90-4119-8542-f543d029bd6a',
  'https://firebasestorage.googleapis.com/v0/b/fir-uploading-project.appspot.com/o/backgrounds%2Fgalaxy-space-3840x2160.jpg?alt=media&token=5ddc6176-3c10-4fa9-9cf9-0bba7921f820',
]

function Backgrounds() {
  const setSelectedBackground = useStore((state) => state.setSelectedBackground)

  return (
    <div className='flex gap-2 flex-wrap'>
      {backgrounds.map((bg) => (
        <div
          key={bg}
          className='bg-cover w-80 h-52'
          style={{ backgroundImage: `url(${bg})` }}
          onClick={() => setSelectedBackground(bg)}
        />
      ))}
    </div>
  )
}

export default Backgrounds
