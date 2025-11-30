import { Check, CheckCheck, Loader2 } from 'lucide-react'

import type { MessageStatus } from '@/store/slices/chat'

interface MessageStatusIconProps {
  status: MessageStatus
  currentUserId: string
}

export function MessageStatusIcon({ status }: MessageStatusIconProps) {
  switch (status) {
    case 'pending':
      return <Loader2 className="text-muted-foreground size-3 animate-spin" />
    case 'sent':
      return <Check className="text-muted-foreground size-3" />
    case 'delivered_partial':
      return <CheckCheck className="text-muted-foreground size-3" />
    case 'delivered_all':
      return <CheckCheck className="text-green-300 size-3" />
    case 'seen_partial':
      return <CheckCheck className="text-green-500 size-3" />
    case 'seen_all':
      return <CheckCheck className="text-blue-500 size-3" />
    default:
      return <></>
  }
}
