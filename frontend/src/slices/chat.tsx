import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "../middleware/chat";

export interface ChatState {
  bridgeAddress: string;
  serverId: string;
  username: string;
  password?: string;

  messages: ChatMessage[];
  users: string[];
  channels: string[];
  motd: string | null;
  isEstablishingConnection: boolean;
  isConnected: boolean;
  currentChannel: string | null;
}

const initialState: ChatState = {
  bridgeAddress: "https://echobridge.jakewalker.xyz",
  serverId: "official-echo",
  username: "echoweb",

  messages: [],
  users: [],
  channels: [],
  motd: null,
  isEstablishingConnection: false,
  isConnected: false,
  currentChannel: null
};

const loadPersistedState = () => {
  return JSON.parse(localStorage.getItem('state') || "{}")
}

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    ...initialState,
    ...loadPersistedState()
  },
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

      // reset most of the state
      state.messages = [];
      state.users = [];
      state.channels = [];
      state.motd = null;
      state.currentChannel = null;
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
    setUsers: (state, action: PayloadAction<{
      users: string[]
    }>) => {
      state.users = action.payload.users;
    },
    updateUsers: (state, action: PayloadAction<{
      user: string,
      fromChannel: string,
      toChannel: string
    }>) => {
      if (action.payload.toChannel === state.currentChannel) {
        if (!state.users.includes(action.payload.user)) {
          state.users.push(action.payload.user);
        }
      } else {
        state.users = state.users.filter((user) => user !== action.payload.user);
      }
    },
    changeChannel: (state, action: PayloadAction<{
      channel: string
    }>) => {
      state.currentChannel = action.payload.channel;
      state.messages = [];
    },
    addMessages: (state, action: PayloadAction<{
      messages: ChatMessage[]
    }>) => {
      state.messages.push(...action.payload.messages);
    },
    sendMessage: (state, action: PayloadAction<{
      content: string
    }>) => {},
    setConnectionParameters: (state, action: PayloadAction<{
      bridgeAddress: string,
      serverId: string,
      username: string,
      password?: string
    }>) => {
      state.bridgeAddress = action.payload.bridgeAddress;
      state.serverId = action.payload.serverId;
      state.username = action.payload.username;
      state.password = action.payload.password;
    }
  }
});

export const chatActions = chatSlice.actions;

export default chatSlice.reducer;
