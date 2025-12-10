import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-normal text-center',
          {
            'bg-gradient-to-r from-brand-yellow to-yellow-400 text-brand-blue hover:shadow-lg hover:shadow-yellow-500/50 font-bold focus-visible:ring-brand-yellow': variant === 'default',
            'border border-brand-blue bg-white text-brand-blue hover:bg-brand-blue hover:!text-white focus-visible:ring-brand-blue': variant === 'outline',
            'text-brand-blue hover:bg-brand-blue/10 focus-visible:ring-brand-blue': variant === 'ghost',
            'bg-brand-blue text-white hover:bg-blue-800 focus-visible:ring-brand-blue': variant === 'secondary',
            'h-10 px-4 py-2': size === 'default',
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }

