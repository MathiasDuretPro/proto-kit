import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Same structure as a shadcn primitive, restyled with semantic tokens only.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-sm rounded-control px-md py-sm text-label outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-action-primary text-action-primary-text',
        secondary: 'bg-action-secondary text-action-secondary-text',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

export function Button({ className, variant, ...props }: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button data-slot="button" className={cn(buttonVariants({ variant }), className)} {...props} />
}
