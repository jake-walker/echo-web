<template>
    <v-dialog v-model="show" width="500">
        <v-card>
            <v-card-title class="headline">Connect</v-card-title>
            <v-card-text>
                <v-text-field v-model="host" label="Host" outlined hint="The Echo WebSocket tunnel to connect to. Must include protocol (ws:// or wss://)." persistent-hint></v-text-field>
                <v-text-field v-model="password" type="password" label="Password" outlined hint="The server's password."></v-text-field>
                <v-text-field v-model="username" label="Username" outlined hint="Your display name for chatting."></v-text-field>
                <v-text-field :value="userId" label="User ID" outlined readonly append-icon="mdi-refresh" @click:append="GENERATE_USERID()" hint="Your unique identifer which is tied to permissions, click the arrow to generate a new one."></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close()">Close</v-btn>
                <v-btn text @click="connect()" color="primary">Connect</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
    props: {
        value: Boolean
    },
    methods: {
        ...mapMutations(['GENERATE_USERID']),
        close() {
            this.show = false;
        },
        connect() {
            this.close();
            this.$store.dispatch("connect");
        }
    },
    computed: {
        ...mapState(["username", "password", "host", "userId"]),
        show: {
            get() {
                return this.value;
            },
            set(value) {
                return this.$emit("input", value);
            }
        }
    }
}
</script>
