import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "../middleware/chat";

export interface ChatState {
  messages: ChatMessage[];
  users: string[];
  channels: string[];
  motd: string | null;
  isEstablishingConnection: boolean;
  isConnected: boolean;
  currentChannel: string | null;
}

const initialState: ChatState = {
  messages: [],
  users: [],
  channels: [],
  motd: null,
  isEstablishingConnection: false,
  isConnected: false,
  currentChannel: null
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    connect: (state) => {
      state.isConnected = false;
      state.isEstablishingConnection = true;
    },
    connected: (state) => {
      state.isConnected = true;
      state.isEstablishingConnection = true;
    },
    disconnect: (state) => {
      state.isConnected = false;
      state.isEstablishingConnection = true;
    },
    disconnected: (state) => {
      state.isConnected = false;
      state.isEstablishingConnection = false;
    },
    recieveMessage: (state, action: PayloadAction<{
      message: ChatMessage
    }>) => {
      state.messages.push(action.payload.message);
    },
    updateChannels: (state, action: PayloadAction<{
      channels: string[]
    }>) => {
      state.channels = action.payload.channels;
    },
    updateMotd: (state, action: PayloadAction<{
      motd: string
    }>) => {
      state.motd = action.payload.motd;
    },
    updateUsers: (state, action: PayloadAction<{
      users: string[]
    }>) => {
      state.users = action.payload.users;
    },
    changeChannel: (state, action: PayloadAction<{
      channel: string
    }>) => {
      state.currentChannel = action.payload.channel;
      state.messages = [];
    },
    sendMessage: (state, action: PayloadAction<{
      content: string
    }>) => {}
  }
});

export const chatActions = chatSlice.actions;

export default chatSlice.reducer;
