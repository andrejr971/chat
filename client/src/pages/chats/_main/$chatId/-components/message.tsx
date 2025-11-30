import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/store/slices/chat'

import { MessageStatusIcon } from './message-status'

type MessageProps = {
  message: ChatMessage
  currentUserId: string
}

export function Message({ message, currentUserId }: MessageProps) {
  const isFromMe = currentUserId === message.senderId

  return (
    <div className={cn('w-full', isFromMe && 'flex justify-end')}>
      <div className={cn('flex flex-col gap-2', isFromMe && 'items-end')}>
        <header className="flex items-center justify-start gap-2">
          <strong className="font-semibold text-sm">
            {message.senderName}
          </strong>
          <span className="text-muted-foreground text-sm">teste</span>
        </header>
        <div
          className={cn(
            'min-w-[120px] max-w-md w-fit p-4 text-md flex flex-col gap-2 rounded-md items-end',
            isFromMe ? 'bg-zinc-200' : 'bg-background ',
          )}
        >
          <p className="w-full">{message.content}</p>
          {isFromMe && (
            <MessageStatusIcon
              currentUserId={currentUserId}
              status={message.status}
            />
          )}
        </div>
      </div>
    </div>
  )
}
