import { ChangeEvent, useId } from 'react'

import { Input, Label } from './styles.ts'

interface RangeSliderProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  min?: number
  max?: number
  step?: number
  value?: number
}

function RangeSlider({ onChange, min = 0, max = 10, step = 1, value = 0 }: RangeSliderProps) {
  const id = useId()

  return (
    <>
      <Input
        type='range'
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
      <Label htmlFor={id} />
    </>
  )
}

export default RangeSlider
