import z from 'zod'

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Sao_Paulo',
})

const formatTime = (date: Date) => timeFormatter.format(date)

export const chatSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    created_at: z.coerce.date().transform(formatTime),
    updated_at: z.coerce.date().transform(formatTime),
    total_members: z.number().default(0),
  })
  .transform((payload) => ({
    id: payload.id,
    name: payload.name,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    totalMembers: payload.total_members,
  }))
export type ChatSchema = z.output<typeof chatSchema>

export const chatListSchema = z.array(chatSchema)
export type ChatListSchema = z.output<typeof chatListSchema>
