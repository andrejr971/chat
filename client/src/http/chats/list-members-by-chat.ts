import { api } from '@/lib/api'

import { userListSchema } from '../schemas/users'

export const listMembersByChat = async (chatId: string) => {
  const response = await api.get(`/chats/${chatId}/members`)
  return userListSchema.parse(response.data)
}
