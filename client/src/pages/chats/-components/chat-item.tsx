import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/hooks/store'
import { joinMemberToChat } from '@/http/chats/join-member'
import type { ChatSchema } from '@/http/schemas/chats'

interface ChatItemProps {
  chat: ChatSchema
}

export function ChatItem({ chat }: ChatItemProps) {
  const state = useAppSelector((state) => state.users)
  const user = state.user!

  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate: mutationJoinMember, isPending } = useMutation({
    mutationKey: ['chats'],
    mutationFn: joinMemberToChat,
  })

  const handleJoin = async () => {
    mutationJoinMember(
      {
        userId: user.id,
        chatId: chat.id,
      },
      {
        onError: (error) => {
          toast.error(error.message)
        },
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['chats'],
            type: 'all',
          })
          router.navigate({
            to: '/chats/$chatId',
            params: {
              chatId: chat.id,
            },
          })
        },
      },
    )
  }

  return (
    <li className="flex flex-col gap-4 bg-card rounded-md border">
      <div className="flex flex-col gap-2 p-4 pb-0">
        <strong className="text-lg font-semibold ">{chat.name}</strong>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            Total de membros
          </span>
          <Badge variant="outline">{chat.totalMembers}</Badge>
        </div>
      </div>
      <div className="w-full p-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          disabled={isPending}
          onClick={handleJoin}
        >
          Entrar no chat
        </Button>
      </div>
    </li>
  )
}
