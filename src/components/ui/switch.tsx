import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-slate-200 transition-colors duration-200 ease-in-out data-[state=checked]:bg-emerald-500',
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className="pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out peer-data-[state=checked]:translate-x-5"
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = 'Switch'