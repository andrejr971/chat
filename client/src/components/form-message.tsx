import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { uuidv7 } from 'uuidv7'
import z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { chatActions } from '@/store/chat'

const messageSchema = z.object({
  message: z.string().min(1),
})
type MessageSchema = z.input<typeof messageSchema>

export function FormMessage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user.currentUser)

  const { register, handleSubmit, reset } = useForm<MessageSchema>({
    resolver: standardSchemaResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  })

  const handleSendMessage = ({ message }: MessageSchema) => {
    if (!user) return
    dispatch(
      chatActions.sendMessage({
        content: message,
        id: uuidv7(),
      }),
    )

    reset({
      message: '',
    })
  }

  return (
    <div className="w-full p-4 max-w-[1216px]">
      <Card className="p-4">
        <CardContent className="p-0">
          <form
            className="w-full flex gap-2"
            onSubmit={handleSubmit(handleSendMessage)}
          >
            <Input
              placeholder="Escreva a sua mensagem"
              className="bg-transparent border-0 outline-0 focus-visible:border-0 focus-visible:ring-ring/0 shadow-none flex-1"
              {...register('message')}
            />
            <Button size="icon">
              <Send className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
