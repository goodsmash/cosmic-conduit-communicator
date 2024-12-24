import React from 'react'

export function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
