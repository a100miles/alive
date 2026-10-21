import { createContext } from 'react'

export const DiscNavigation = createContext<((source: HTMLElement, releaseId: string) => void) | null>(null)
