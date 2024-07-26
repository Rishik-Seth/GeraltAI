import { useRouter } from 'next/router'
import React from 'react'

export default function ErrorPage({className}) {
  const router = useRouter()
  return (
    <div className={`flex h-screen w-screen items-center justify-center bg-red-300 ${className}`}>
      <p className="text-sm font-medium text-black animate-bounce">
        {'Error Occured :('}{' '}
        <span
          className="text-blue-500 underline cursor-pointer"
          onClick={() => {
            router.reload()
          }}
        >
          Refresh
        </span>
      </p>
    </div>
  )
}
