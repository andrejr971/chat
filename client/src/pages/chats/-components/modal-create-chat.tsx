import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/hooks/store'
import { createChat } from '@/http/chats/create'

interface ModalCreateChatProps {
  children: React.ReactNode
}

const createChatPayloadSchema = z.object({
  name: z
    .string()
    .min(3, 'Para criar um chat o nome precisa ter mais de 3 caracteres'),
})
type CreateChatPayloadSchema = z.input<typeof createChatPayloadSchema>

export function ModalCreateChat({ children }: ModalCreateChatProps) {
  const state = useAppSelector((state) => state.users)
  const user = state.user!

  const [openModal, setOpenModal] = useState(false)

  const form = useForm<CreateChatPayloadSchema>({
    resolver: standardSchemaResolver(createChatPayloadSchema),
    defaultValues: {
      name: '',
    },
  })

  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate: mutationCreateChat, isPending } = useMutation({
    mutationKey: ['chats'],
    mutationFn: createChat,
  })

  const handleSubmit = async ({ name }: CreateChatPayloadSchema) => {
    mutationCreateChat(
      {
        name,
        userId: user.id,
      },
      {
        onError: (error) => {
          toast.error(error.message)
        },
        onSuccess: (chatId) => {
          queryClient.invalidateQueries({
            queryKey: ['chats'],
            type: 'all',
          })
          setOpenModal(false)
          toast.success('Chat criado com sucesso')
          router.navigate({
            to: '/chats/$chatId',
            params: {
              chatId,
            },
          })
        },
      },
    )
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Criar chat</DialogTitle>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do chat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending} type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
