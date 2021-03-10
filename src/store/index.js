import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistance from 'vuex-persist';
import socket from './socket';

Vue.use(Vuex);

const vuexLocal = new VuexPersistance({
    storage: window.localStorage,
    // reducer: (state) => ({x: state.x})
    reducer: () => ({})
});

export default new Vuex.Store({
    state: {
    },
    mutations: {
    },
    actions: {
    },
    modules: {
        socket
    },
    plugins: [
        vuexLocal.plugin
    ]
})
