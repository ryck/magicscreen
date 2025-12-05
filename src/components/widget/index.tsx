import type { ReactNode } from 'react'
import { cn } from '@/utils'

type WidgetProps = {
  children: ReactNode
  className?: string
}

export const Widget = ({ children, className }: WidgetProps) => {
  return <div className={cn('w-full xl:w-4/5 2xl:w-3/5', className)}>{children}</div>
}
