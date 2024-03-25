import { ChangeEvent, useId } from 'react'

interface UploadContainerProps {
  children: JSX.Element
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  multiple?: boolean
}

function UploadWrapper({ children, onChange, multiple = false }: UploadContainerProps) {
  const id = useId()

  return (
    <>
      <input
        type='file'
        accept='.jpg,.jpeg,.png'
        multiple={multiple}
        className='hidden'
        id={id}
        onChange={onChange}
      />
      <label htmlFor={id}>{children}</label>
    </>
  )
}

export default UploadWrapper
