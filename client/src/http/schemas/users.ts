import z from 'zod'

export const userSchema = z
  .object({
    id: z.uuid(),
    username: z.string(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
  })
  .transform((payload) => ({
    id: payload.id,
    username: payload.username,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  }))
export type UserSchema = z.output<typeof userSchema>

export const userListSchema = z.array(userSchema)
export type UserListSchema = z.output<typeof userListSchema>
