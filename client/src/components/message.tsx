import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/store/chat'

import { MessageStatusIcon } from './message-status'

type MessageProps = {
  message: ChatMessage
  currentUserId: string
}

export function Message({ message, currentUserId }: MessageProps) {
  if (message.kind === 'system') {
    return (
      <div className="w-full flex justify-center my-2">
        <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground">
          {message.content}
        </span>
      </div>
    )
  }

  const isFromMe = currentUserId === message.from

  return (
    <div className={cn('w-full', isFromMe && 'flex justify-end')}>
      <div className={cn('flex flex-col gap-2', isFromMe && 'items-end')}>
        <header className="flex items-center justify-start gap-2">
          <strong className="font-semibold text-sm">{message.from}</strong>
          <span className="text-muted-foreground text-sm">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </header>
        <div
          className={cn(
            'min-w-[120px] max-w-md w-fit p-4 text-md flex flex-col gap-2 rounded-md items-end',
            isFromMe ? 'bg-zinc-200' : 'bg-background ',
          )}
        >
          <p className="w-full">{message.content}</p>
          {isFromMe && message.status && (
            <MessageStatusIcon status={message.status} />
          )}
        </div>
      </div>
    </div>
  )
}
