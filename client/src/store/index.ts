import { configureStore } from '@reduxjs/toolkit'

import { websocketMiddleware } from '@/websockets'

import { chatListReducer, chatReducer } from './slices/chat'
import { usersReducer } from './slices/users'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    chat: chatReducer,
    chatList: chatListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(websocketMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
