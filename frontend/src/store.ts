import { configureStore } from '@reduxjs/toolkit';
import chatMiddleware from './middleware/chat';
import chatSlice from './slices/chat';

export const store = configureStore({
  reducer: {
    chat: chatSlice
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat([chatMiddleware])
  }
});

store.subscribe(() => {
  const state = store.getState();

  localStorage.setItem('state', JSON.stringify({
    bridgeAddress: state.chat.bridgeAddress,
    serverId: state.chat.serverId,
    username: state.chat.username,
    password: state.chat.password
  }));
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
