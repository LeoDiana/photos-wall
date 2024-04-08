import { ChangeEvent, useId } from 'react'

import { Input } from './styles.ts'

interface UploadContainerProps {
  children: JSX.Element
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  multiple?: boolean
}

function UploadWrapper({ children, onChange, multiple = false }: UploadContainerProps) {
  const id = useId()

  return (
    <>
      <Input type='file' accept='.jpg,.jpeg,.png' multiple={multiple} id={id} onChange={onChange} />
      <label htmlFor={id}>{children}</label>
    </>
  )
}

export default UploadWrapper
