import { api } from '@/lib/api'

import { type UserSchema, userSchema } from '../schemas/users'

export type PayloadCreateUser = {
  username: string
}

export const createUser = async (
  payload: PayloadCreateUser,
): Promise<UserSchema> => {
  const response = await api.post('/users', payload)
  return userSchema.parse(response.data)
}
