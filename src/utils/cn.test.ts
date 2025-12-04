import { describe, expect, it } from 'vitest'

import { cn } from './index'

describe('cn utility function', () => {
	it('should merge simple classes', () => {
		const result = cn('text-red-500', 'bg-blue-200')
		expect(result).toBe('text-red-500 bg-blue-200')
	})

	it('should handle conditional classes', () => {
		const isActive = true
		const result = cn('base-class', isActive && 'active-class')
		expect(result).toBe('base-class active-class')
	})

	it('should handle conflicting Tailwind classes', () => {
		const result = cn('bg-red-500', 'bg-blue-500')
		expect(result).toBe('bg-blue-500') // Later class wins
	})

	it('should handle objects', () => {
		const result = cn({
			'text-red-500': true,
			'text-blue-500': false,
			'bg-gray-100': true
		})
		expect(result).toBe('text-red-500 bg-gray-100')
	})

	it('should handle arrays', () => {
		const result = cn(['text-red-500', 'bg-blue-200'], ['p-4', 'm-2'])
		expect(result).toBe('text-red-500 bg-blue-200 p-4 m-2')
	})

	it('should handle mixed arrays with conditionals', () => {
		const isActive = true
		const isDisabled = false
		const result = cn([
			'base-class',
			isActive && 'active-class',
			isDisabled && 'disabled-class'
		])
		expect(result).toBe('base-class active-class')
	})

	it('should handle empty and falsy values', () => {
		const result = cn('', null, undefined, false, 'valid-class', 0)
		expect(result).toBe('valid-class')
	})

	it('should handle complex Tailwind conflicts', () => {
		const result = cn(
			'p-4 px-2', // px-2 should override p-4's horizontal padding
			'm-4 mx-auto', // mx-auto should override m-4's horizontal margin
			'text-lg text-sm' // last class wins
		)
		expect(result).toBe('p-4 px-2 m-4 mx-auto text-sm')
	})

	it('should handle responsive and state variants', () => {
		const result = cn(
			'bg-red-500 md:bg-blue-500',
			'hover:bg-green-500 focus:bg-yellow-500'
		)
		expect(result).toBe(
			'bg-red-500 md:bg-blue-500 hover:bg-green-500 focus:bg-yellow-500'
		)
	})

	it('should handle conflicting responsive variants', () => {
		const result = cn('text-sm md:text-lg', 'md:text-xl lg:text-2xl')
		expect(result).toBe('text-sm md:text-xl lg:text-2xl')
	})

	it('should handle nested objects and arrays', () => {
		const result = cn(
			'base',
			{
				'text-red-500': true,
				'text-blue-500': false
			},
			['p-4', { 'm-2': true, 'm-4': false }],
			'final-class'
		)
		expect(result).toBe('base text-red-500 p-4 m-2 final-class')
	})

	it('should handle spacing conflicts correctly', () => {
		const result = cn('p-2 p-4 pt-6 pr-8')
		expect(result).toBe('p-4 pt-6 pr-8')
	})

	it('should handle border conflicts', () => {
		const result = cn(
			'border border-2 border-4',
			'border-blue-500 border-red-500',
			'border-solid border-dashed'
		)
		expect(result).toBe('border-4 border-red-500 border-dashed')
	})

	it('should handle width and height conflicts', () => {
		const result = cn('w-4 w-8 w-full', 'h-4 h-8 h-screen', 'max-w-lg max-w-sm')
		expect(result).toBe('w-full h-screen max-w-sm')
	})

	it('should preserve custom classes that do not conflict', () => {
		const result = cn(
			'custom-class-1',
			'bg-blue-500 bg-red-500',
			'custom-class-2',
			'text-lg text-sm'
		)
		expect(result).toBe('custom-class-1 bg-red-500 custom-class-2 text-sm')
	})

	it('should handle function calls with multiple argument types', () => {
		const condition = true
		const result = cn(
			'base',
			condition && 'conditional',
			{ active: true, disabled: false },
			['array', 'classes'],
			'final'
		)
		expect(result).toBe('base conditional active array classes final')
	})

	it('should handle dark mode variants', () => {
		const result = cn('bg-white dark:bg-gray-900', 'text-black dark:text-white')
		expect(result).toBe('bg-white dark:bg-gray-900 text-black dark:text-white')
	})

	it('should handle conflicting dark mode variants', () => {
		const result = cn(
			'dark:bg-gray-800 dark:bg-gray-900',
			'dark:text-gray-200 dark:text-white'
		)
		expect(result).toBe('dark:bg-gray-900 dark:text-white')
	})
})
