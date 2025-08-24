import React from 'react'

interface ConsultantAuthGuardProps {
  children: React.ReactNode
  pageName?: string
}

export default function ConsultantAuthGuard({ children }: ConsultantAuthGuardProps) {
  return <div>{children}</div>
}