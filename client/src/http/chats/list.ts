import { api } from '@/lib/api'

import { chatListSchema } from '../schemas/chats'

export const listAllChats = async () => {
  const response = await api.get('/chats')
  return chatListSchema.parse(response.data)
}
