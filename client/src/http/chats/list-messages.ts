import { api } from '@/lib/api'

import { messageListSchema } from '../schemas/chats'

export const listMessagesByChat = async (chatId: string) => {
  const response = await api.get(`/chats/${chatId}/messages`)
  return messageListSchema.parse(response.data)
}
