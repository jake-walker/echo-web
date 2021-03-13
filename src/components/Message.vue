<template>
    <v-list-item>
        <!-- <v-list-item-avatar>
        <v-img :src=""></v-img>
        </v-list-item-avatar> -->
        <v-list-item-content>
            <div class="text--primary mb-2">
                <span class="font-weight-bold" :style="{ color: message.color }">{{ message.author }}</span>
                &bull;
                <span class="font-weight-light">{{ date }}</span>
            </div>
            <div class="text--primary" v-html="message.content"></div>
        </v-list-item-content>
    </v-list-item>
</template>

<script>
import { DateTime } from 'luxon';

export default {
    name: 'Message',
    props: ["message"],
    computed: {
        date() {
            const date = DateTime.fromJSDate(this.message.sent);
            return date.toLocaleString(DateTime.DATETIME_SHORT);
        }
    }
}
</script>
