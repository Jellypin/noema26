import { machines as base } from './machines'
import { extras } from './extras'

export const machines = base.map((m) => ({ ...m, ...(extras[m.id] || {}) }))