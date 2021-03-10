<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>My files</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Yeet!
          </v-list-item-title>
          <v-list-item-subtitle>
            lol
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider/>

      <v-list dense>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-message-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Chat</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block depressed color="primary" v-if="!connected" @click="connect()">
            Connect
          </v-btn>
          <v-btn block outlined color="red" v-else @click="disconnect()">
            Disconnect
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
      <v-btn color="primary" @click="connect()">Connect</v-btn>
      <v-btn color="primary" @click="disconnect()">Disconnect</v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'App',

  data: () => ({
    drawer: null
  }),
  computed: {
    ...mapState({
      connected: state => state.socket.connected
    })
  },
  methods: {
      connect() {
        this.$connect();
      },
      disconnect() {
        this.$disconnect();
      }
    }
};
</script>
