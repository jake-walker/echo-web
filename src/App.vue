<template>
  <v-app>
    <v-app-bar app color="primary" dark clipped-right>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ channel.name || 'Echo Web' }}</v-toolbar-title>
      <!-- <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Echo Web
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ motd }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider/>

      <v-list dense>
        <v-list-item-group :value="channels.indexOf(channel.name)">
          <v-list-item v-for="channel in channels" :key="channel" @click="switchChannel(channel)">
            <v-list-item-icon>
              <v-icon>mdi-message-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ channel }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block depressed color="primary" v-if="!connected" @click="showConnectionDialog = true">
            Connect
          </v-btn>
          <v-btn block outlined color="red" v-else @click="disconnect()">
            Disconnect
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-navigation-drawer app clipped right>
      <v-list dense>
        <v-menu v-for="member in channel.members" :key="member">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item v-bind="attrs" v-on="on">
              {{ member }}
            </v-list-item>
          </template>

          <v-list dense>
            <v-list-item @click="kick(member)">Kick {{ member }}</v-list-item>
            <v-list-item @click="ban(member)">Ban {{ member }}</v-list-item>
            <v-list-item @click="pm(member)">Private message {{ member }}</v-list-item>
          </v-list>
        </v-menu>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-list class="fill-height" v-if="connected && channel.messages.length > 0">
        <Message v-for="(message, i) in messages" :message="message" :key="i" />
      </v-list>
      <v-container class="text-center" v-else>
        {{ disconnectReason }}
        <div class="py-10" v-if="!connected">
          <h2>You're not connected!</h2>
          <p v-if="handshakeState == 'begin'">Use the connect button in the bottom left to connect.</p>
          <p v-else>Handshake in progress ({{ handshakeState}})...</p>
        </div>
        <div class="py-10" v-else-if="!channel.name">
          <h2>Choose a channel</h2>
          <p>Choose a channel on the left sidebar to start chatting!</p>
        </div>
        <div class="py-10" v-else-if="channel.messages.length <= 0">
          <h2>No messages here...</h2>
          <p>It's looking a bit quiet in {{ channel.name }}! Be the first to send a message.</p>
        </div>
      </v-container>

      <connection-dialog v-model="showConnectionDialog"/>
    </v-main>

    <v-footer app inset color="white" class="pb-3">
      <v-text-field v-model="message" ref="messageBox" @keyup.enter="send" outlined hide-details dense :disabled="!connected"/>
      <v-btn color="primary" depressed @click="send" style="min-height: 40px;" class="ml-3" :disabled="!connected">Send</v-btn>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Message from './components/Message';
import ConnectionDialog from './components/ConnectionDialog';

export default {
  name: 'App',
  components: {
    Message,
    ConnectionDialog
  },
  data: () => ({
    drawer: null,
    message: "",
    showConnectionDialog: false
  }),
  computed: {
    ...mapState(["motd", "channels", "handshakeState", "channel", "userId", "disconnectReason"]),
    connected() {
      return this.$store.state.connected && this.$store.state.handshakeState == 'done';
    },
    messages() {
      return this.channel.messages;
    }
  },
  methods: {
    ...mapActions(["disconnect", "switchChannel"]),
    send() {
      this.$store.dispatch("sendText", this.message);
      this.message = "";
      this.$refs.messageBox.focus();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
      });
    },
    kick(user) {
      this.message = `/kick ${user}`;
      this.$refs.messageBox.focus();
    },
    ban(user) {
      this.message = `/ban ${user}`;
      this.$refs.messageBox.focus();
    },
    pm(user) {
      this.message = `/pm ${user} `;
      this.$refs.messageBox.focus();
    }
  },
  watch: {
    messages() {
      this.scrollToBottom();
    }
  }
};
</script>
