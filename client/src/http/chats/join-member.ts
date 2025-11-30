import { api } from '@/lib/api'

type PayloadJoinMemberToChat = {
  chatId: string
  userId: string
}

export const joinMemberToChat = async ({
  chatId,
  userId,
}: PayloadJoinMemberToChat) => {
  await api.post(`/chats/${chatId}/join-member`, {
    user_id: userId,
  })
}
