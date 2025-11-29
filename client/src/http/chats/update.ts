import { api } from '@/lib/api'

import { type ChatSchema, chatSchema } from '../schemas/chats'

type PayloadUpdateNameChat = {
  chatId: string
  name: string
}

export const updateNameChat = async ({
  chatId,
  name,
}: PayloadUpdateNameChat): Promise<ChatSchema> => {
  const response = await api.put(`/chats/${chatId}`, {
    name,
  })
  return chatSchema.parse(response.data)
}
