import Link from 'next/link'

interface LogoProps {
  className?: string
  height?: number
  width?: number
  linkToHome?: boolean
}

export default function Logo({ 
  className = '', 
  height = 40, 
  width = 200, 
  linkToHome = true 
}: LogoProps) {
  const logoElement = (
    <img
      src="/assets/images/Inbound-logo-RGB.svg"
      alt="Inbound Logo"
      width={width}
      height={height}
      className={`object-contain ${className}`}
    />
  )

  if (linkToHome) {
    return (
      <Link href="/" className="flex items-center">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}