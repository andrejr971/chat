import { api } from '@/lib/api'

import { chatListSchema } from '../schemas/chats'

export const listMyChats = async (userId: string) => {
  const response = await api.get(`/users/${userId}/chats`)
  return chatListSchema.parse(response.data)
}
