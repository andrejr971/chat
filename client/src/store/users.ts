import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { uuidv7 } from 'uuidv7'
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

type IniitialState = {
  currentUser: UserSchema | undefined
}

const COOKIE_KEY = 'chat.dev:user'

function getUserFromCookie(): UserSchema | undefined {
  if (typeof window === 'undefined') return undefined

  const cookies = parseCookies()
  const raw = cookies[COOKIE_KEY]

  if (!raw) return undefined

  try {
    return JSON.parse(raw) as UserSchema
  } catch {
    return undefined
  }
}

const initialState: IniitialState = {
  currentUser: getUserFromCookie(),
}

const updateUserCookie = (user: UserSchema) => {
  setCookie(null, COOKIE_KEY, JSON.stringify(user), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
}

export const usersSlice = createSlice({
  name: 'users',
  initialState,

  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        username: string
      }>,
    ) => {
      const user = {
        id: uuidv7(),
        username: action.payload.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (action.payload) {
        state.currentUser = user
        updateUserCookie(user)
      } else {
        destroyCookie(null, COOKIE_KEY, { path: '/' })
      }
    },
  },
})

export const usersReducer = usersSlice.reducer
export const usersActions = usersSlice.actions
