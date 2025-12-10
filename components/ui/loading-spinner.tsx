'use client'

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} rounded-full border-4 border-brand-yellow/20 border-t-brand-yellow animate-spin`}
      />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  )
}




