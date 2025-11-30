import z from 'zod'

import type { MessageStatus } from '@/store/slices/chat'

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Sao_Paulo',
})

const formatTime = (date: Date) => timeFormatter.format(date)
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Sao_Paulo',
})

const formatDateTime = (date: Date) => dateTimeFormatter.format(date)

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

const senderNestedSchema = z.object({
  id: z.string(),
  username: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export const messageSchema = z
  .object({
    id: z.string(),
    chat_id: z.string(),
    sender_id: z.string(),
    content: z.string(),
    status: z.enum([
      'pending',
      'sent',
      'delivered_partial',
      'delivered_all',
      'seen_partial',
      'seen_all',
    ]),
    created_at: z.coerce.date(),
    delivered_count: z.number().nullable().default(0),
    seen_count: z.number().nullable().default(0),
    total_participants: z.number().nullable().default(0),
    sender: senderNestedSchema.optional(),
  })
  .transform((payload) => ({
    id: payload.id,
    chatId: payload.chat_id,
    senderId: payload.sender_id,
    senderName: payload.sender?.username ?? '',
    content: payload.content,
    createdAt: formatDateTime(payload.created_at),
    status: payload.status as MessageStatus,
    deliveredCount: payload.delivered_count ?? 0,
    seenCount: payload.seen_count ?? 0,
    totalParticipants: payload.total_participants ?? 0,
  }))
export type MessageSchema = z.output<typeof messageSchema>

export const messageListSchema = z.array(messageSchema)
export type MessageListSchema = z.output<typeof messageListSchema>
