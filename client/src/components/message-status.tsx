import { Check, CheckCheck } from 'lucide-react'

import type { MessageStatus } from '@/store/chat'

interface MessageStatusIconProps {
  status: MessageStatus
}

export function MessageStatusIcon({ status }: MessageStatusIconProps) {
  switch (status) {
    case 'received':
      return <Check className="text-muted-foreground size-3" />
    case 'sent':
      return <CheckCheck className="text-muted-foreground size-3" />
    case 'delivered':
      return <CheckCheck className="text-green-300 size-3" />
    case 'seen':
      return <CheckCheck className="text-blue-500 size-3" />
    default:
      return <></>
  }
}
