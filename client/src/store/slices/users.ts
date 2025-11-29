import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { destroyCookie, parseCookies, setCookie } from 'nookies'

import type { UserSchema } from '@/http/schemas/users'
import { createUser, type PayloadCreateUser } from '@/http/users/create'

type IniitialState = {
  user: UserSchema | undefined
  loading: boolean
  error?: string
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
  user: getUserFromCookie(),
  loading: false,
}

const updateUserCookie = (user: UserSchema) => {
  setCookie(null, COOKIE_KEY, JSON.stringify(user), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
}

export const actionCreateUser = createAsyncThunk(
  'create/user',
  async (payload: PayloadCreateUser, { rejectWithValue }) => {
    try {
      const user = await createUser(payload)

      updateUserCookie(user)

      return user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Erro ao criar usuário')
    }
  },
)

export const usersSlice = createSlice({
  name: 'users',
  initialState,

  reducers: {
    setUser: (state, action: PayloadAction<UserSchema | undefined>) => {
      state.user = action.payload

      if (action.payload) {
        updateUserCookie(action.payload)
      } else {
        destroyCookie(null, COOKIE_KEY, { path: '/' })
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(actionCreateUser.pending, (state) => {
        state.loading = true
      })
      .addCase(actionCreateUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(actionCreateUser.rejected, (state, action) => {
        state.loading = false
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Erro ao criar usuário'
      })
  },
})

export const usersReducer = usersSlice.reducer
export const usersActions = usersSlice.actions
