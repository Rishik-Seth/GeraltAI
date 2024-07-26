import React from 'react'

export default function LoadingPage({ className }) {
  return (
    <div
      className={`flex h-screen w-screen items-center justify-center ${className}`}
    >
      <p className="animate-ping text-sm font-medium">Loading...</p>
    </div>
  )
}
