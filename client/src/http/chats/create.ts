import { api } from '@/lib/api'

import { chatSchema } from '../schemas/chats'

type PayloadCreateChat = {
  name: string
  userId: string
}

export const createChat = async (
  payload: PayloadCreateChat,
): Promise<string> => {
  const response = await api.post('/chats', {
    name: payload.name,
    user_id: payload.userId,
  })
  const chat = chatSchema.parse(response.data)
  return chat.id
}
