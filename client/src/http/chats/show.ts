import { api } from '@/lib/api'

import { type ChatSchema, chatSchema } from '../schemas/chats'

export const showChatDetail = async (chatId: string): Promise<ChatSchema> => {
  const response = await api.get(`/chats/${chatId}`)
  return chatSchema.parse(response.data)
}
