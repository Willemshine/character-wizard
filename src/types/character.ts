import { z } from 'zod'

export const CharacterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  race: z.string().min(1, 'Race is required'),
  class: z.string().min(1, 'Class is required'),
  level: z.number().min(1).max(20),
  attributes: z.object({
    strength: z.number().min(1).max(30),
    dexterity: z.number().min(1).max(30),
    constitution: z.number().min(1).max(30),
    intelligence: z.number().min(1).max(30),
    wisdom: z.number().min(1).max(30),
    charisma: z.number().min(1).max(30),
  }),
  hitPoints: z.number().min(0).optional(),
  background: z.string().optional(),
})

export type Character = z.infer<typeof CharacterSchema>

export interface ModulePack {
  id: string
  name: string
  description: string
  enabled: boolean
}
