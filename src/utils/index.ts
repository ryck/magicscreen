import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for merging Tailwind CSS classes with clsx and tailwind-merge
 *
 * Only use this when you need:
 * - Conditional classes: cn('base', condition && 'conditional')
 * - Conflicting classes: cn('bg-red-500', 'bg-blue-500') → 'bg-blue-500'
 * - Multiple class sources: cn(baseClasses, props.className, variants[size])
 *
 * For simple static classes, use className="..." directly
 *
 * @param inputs - Class values to merge
 * @returns Merged and deduplicated class string
 *
 * @example
 * // ✅ Good usage - conditional classes
 * cn('btn', isActive && 'btn-active', size === 'lg' && 'btn-lg')
 *
 * // ✅ Good usage - conflicting classes
 * cn('bg-red-500', someCondition && 'bg-blue-500')
 *
 * // ❌ Avoid - simple static classes
 * cn('text-lg font-bold') // Just use className="text-lg font-bold"
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}
