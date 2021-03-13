import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistance from 'vuex-persist';
import cryptoRandomString from 'crypto-random-string';
import { doHandshake } from '../messaging/handshake';
import handleMessage from '../messaging/handler';
import { Message } from '../messaging/message';

Vue.use(Vuex);

const vuexLocal = new VuexPersistance({
    storage: window.localStorage,
    reducer: (state) => ({
        userId: state.userId,
        username: state.username,
        password: state.password,
        host: state.host
    })
});

export default new Vuex.Store({
    state: () => ({
        username: "echowebtest",
        password: "mypassword",
        host: "ws://localhost:9000",
        userId: cryptoRandomString({ length: 16, type: 'alphanumeric' }),

        connected: false,
        sessionKey: null,
        handshakeState: "begin",
        channels: [],
        motd: "",
        disconnectReason: null,

        channel: {
            name: "",
            members: [],
            messages: []
        }
    }),
    mutations: {
        SOCKET_ONOPEN(state, event) {
            console.log("Websocket connected!", state, event);
            Vue.prototype.$socket = event.currentTarget;
            state.disconnectReason = null;
            state.connected = true;
            state.handshakeState = "begin";
            doHandshake(event.currentTarget, state);
        },
        SOCKET_ONCLOSE(state, event) {
            console.log("Websocket disconnected!", state, event);
            state.connected = false;

            state.sessionKey = null;
            state.handshakeState = "begin";
            state.channels = [];
            state.channel.name = "";
            state.channel.members = [];
            state.channel.messages = [];
            state.currentChannel = null;
            state.motd = "";
        },
        SOCKET_ONERROR(state, event) {
            console.error(state, event);
        },
        SOCKET_ONMESSAGE(state, data) {
            handleMessage(Vue.prototype.$socket, state, data);
        },
        GENERATE_USERID(state) {
            state.userId = cryptoRandomString({ length: 16, type: 'alphanumeric' });
        }
    },
    actions: {
        sendMessage(context, message) {
            console.debug("Sending message", message);
            Vue.prototype.$socket.send(message.encode(context.state.sessionKey));
        },
        connect(context) {
            const host = context.state.host;
            console.log(`Connecting to '${host}'...`);

            Vue.prototype.$connect(host);
        },
        disconnect(context) {
            // Disconnect gracefully
            const disconnectMessage = new Message(context.state.userId, "disconnect");
            context.dispatch("sendMessage", disconnectMessage);

            // Ensure the connection is closed
            Vue.prototype.$disconnect();
        },
        switchChannel(context, channel) {
            context.state.channel.name = "";
            context.state.channel.members = [];
            context.state.channel.messages = [];

            if (context.state.channel.name) {
                console.debug(`Leaving channel ${context.state.channel.name}...`);
                const leaveChannelMessage = new Message(context.state.userId, "leaveChannel");
                context.dispatch("sendMessage", leaveChannelMessage);
                context.state.channel.name = null;
            }

            if (channel) {
                console.debug(`Joining channel ${channel}...`);
                const switchChannelMessage = new Message(context.state.userId, "changeChannel", channel);
                context.dispatch("sendMessage", switchChannelMessage);
                context.state.channel.name = channel;
            }
        },
        sendText(context, text) {
            const textMessage = new Message(context.userId, "userMessage", text);
            context.dispatch("sendMessage", textMessage);
        }
    },
    plugins: [
        vuexLocal.plugin
    ]
})
