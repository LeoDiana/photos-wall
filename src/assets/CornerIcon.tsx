interface CornerIconProps {
  color?: string
}

function CornerIcon({ color = '#D9D9D9' }: CornerIconProps) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 100 100'>
      <path
        d='M0 2C0 0.895429 0.895431 0 2 0H18C19.1046 0 20 0.895431 20 2V79.1716C20 79.702 19.7893 80.2107 19.4142 80.5858L3.41421 96.5858C2.15428 97.8457 0 96.9534 0 95.1716V2Z'
        fill={color}
      />
      <path
        d='M2 8.74227e-08C0.895429 3.91404e-08 -3.91405e-08 0.895431 -8.74228e-08 2L-7.86805e-07 18C-8.35087e-07 19.1046 0.89543 20 2 20L79.1716 20C79.702 20 80.2107 19.7893 80.5858 19.4142L96.5858 3.41422C97.8457 2.15429 96.9534 4.23797e-06 95.1716 4.16008e-06L2 8.74227e-08Z'
        fill={color}
      />
    </svg>
  )
}

export default CornerIcon
