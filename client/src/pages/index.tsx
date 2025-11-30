import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { MessageCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAppDispatch } from '@/hooks/store'
import { usersActions } from '@/store/users'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: ({ context: { store } }) => {
    const state = store.getState()
    const isUser = state.user.currentUser

    if (isUser) {
      throw redirect({
        to: '/chats',
      })
    }
  },
})

const schemaValidation = z.object({
  username: z.string().min(3, 'O username precisa ter no mínimo 3 caracteres'),
})
type SchemaValidation = z.input<typeof schemaValidation>

function RouteComponent() {
  const form = useForm<SchemaValidation>({
    resolver: standardSchemaResolver(schemaValidation),
    defaultValues: {
      username: '',
    },
  })

  const router = useRouter()

  const dispatch = useAppDispatch()

  const handleSubmit = async (payload: SchemaValidation) => {
    dispatch(usersActions.setUser(payload))
    router.navigate({
      to: '/chats',
    })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="max-w-md w-full flex flex-col gap-6 items-center"
        >
          <div className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md">
              <MessageCircle className="size-6" />
            </div>
            <span className="sr-only">Chat.dev</span>
          </div>

          <h1 className="text-xl font-bold">Seja bem-vindo ao Chat.dev</h1>

          <div className="w-full space-y-1">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-center">
                    Digite um username para entrar no sistema.
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="chat.dev" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full">
            Começar
          </Button>
        </form>
      </Form>
    </div>
  )
}
