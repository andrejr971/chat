import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type MessageStatus = 'sent' | 'received' | 'delivered' | 'seen'

export type ChatMessage = {
  id: string
  content: string
  from: string
  timestamp: string
  status?: MessageStatus
  kind?: 'user' | 'system'
}

type ChatState = {
  username: string
  connected: boolean
  error: string
  messages: ChatMessage[]
}

const initialState: ChatState = {
  username: '',
  connected: false,
  error: '',
  messages: [],
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    connect: (state, action: PayloadAction<{ username: string }>) => {
      state.username = action.payload.username
      state.messages = []
    },
    disconnect: () => initialState,
    sendMessage: (
      state,
      _action: PayloadAction<{ id: string; content: string }>,
    ) => state,
    markSeen: (state, _action: PayloadAction<{ id: string }>) => state,
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    upsertMessage: (state, action: PayloadAction<ChatMessage>) => {
      const idx = state.messages.findIndex((m) => m.id === action.payload.id)
      if (idx >= 0) {
        state.messages[idx] = { ...state.messages[idx], ...action.payload }
      } else {
        state.messages.push(action.payload)
      }
    },
    setMessageStatus: (
      state,
      action: PayloadAction<{ id: string; status: MessageStatus }>,
    ) => {
      const target = state.messages.find((m) => m.id === action.payload.id)
      if (target) {
        target.status = action.payload.status
      }
    },
    reset: () => initialState,
  },
})

export const chatReducer = chatSlice.reducer
export const chatActions = chatSlice.actions
